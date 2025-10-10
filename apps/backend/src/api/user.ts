import mysql from 'mysql'
import type { Express } from 'express'
import { PostDetail, PostTotal, UserInfo } from '@forum-monorepo/types'
import { dbQueryPromise, getNonEssentialAuthUserId } from './index'

export function registerUserAPI(db: mysql.Connection, app: Express) {
  // 用户信息接口
  app.post('/user/info', (req, res) => {
    const { user_id } = req.body
    const sql = `
      select 
        u.user_id, 
        username, 
        user_avatar, 
        user_email, 
        registration_time, 
        follows, 
        fans, 
        background_img, 
        sex, 
        signature 
      from 
        users u 
      where 
        u.user_id = ?`

    db.query(sql, [user_id], (err, result: UserInfo[]) => {
      if (err) {
        return res.status(500).json({
          // 返回错误响应
          code: 1,
          message: '数据库查询错误',
          error: err.message,
        })
      }

      if (result.length === 0) {
        return res.status(404).json({
          code: 2,
          message: '未找到对应id的user',
        })
      }

      res.json({
        code: 0,
        message: '请求成功',
        data: result,
      })
    })
  })

  // 查询用户帖子接口
  app.post('/user/posts', async (req, res) => {
    const { creator_user_id } = req.body
    const page = parseInt(req.body.page) || 1
    const limit = parseInt(req.body.limit) || 10
    const offset = (page - 1) * limit
    const user_id = getNonEssentialAuthUserId(req)

    const sql = `
      select 
        p.p_id, 
        p.user_id, 
        p_view_count, 
        p_collect_count, 
        p_share_count, 
        p_comment_count, 
        p_content, 
        p_images, 
        user_avatar, 
        username, 
        is_public 
      FROM 
        post p 
      left join 
        users u on p.user_id = u.user_id 
      LEFT JOIN 
        collection c ON p.p_id = c.p_id 
      AND 
        c.user_id = ? 
      where 
        p.user_id = ? 
      order by 
        publish_time desc 
      LIMIT ? 
      OFFSET ?`

    const countSql = `
      select 
        count(*) as total 
      FROM 
        post p 
      left join 
        users u on p.user_id =u.user_id 
      LEFT JOIN 
        collection c ON p.p_id = c.p_id 
      AND 
        c.user_id = ? 
      where 
        p.user_id = ?`

    try {
      const [list, count] = await Promise.all([
        dbQueryPromise<PostDetail>(db, sql, [
          user_id,
          creator_user_id,
          limit,
          offset,
        ]),
        dbQueryPromise<PostTotal>(db, countSql, [user_id, creator_user_id]),
      ])

      res.json({
        code: 0,
        message: '请求成功',
        data: list,
        total: count[0]?.total,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)

      res.status(500).json({
        code: 1,
        message: '查询错误',
        error: message,
      })
    }
  })
}
