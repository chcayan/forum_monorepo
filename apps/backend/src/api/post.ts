import { PostDetail, PostInfo, PostTotal } from '@forum-monorepo/types'
import type { Express } from 'express'
import mysql from 'mysql'
import { dbQueryPromise, getNonEssentialAuthUserId } from './index'

export function registerPostAPI(db: mysql.Connection, app: Express) {
  // 帖子列表接口
  app.get('/post', async (req, res) => {
    const userId: string | null = (req.query.user_id as string) || null
    const page: number = parseInt(req.query.page as string) || 1
    const limit: number = parseInt(req.query.limit as string) || 10
    const offset: number = (page - 1) * limit

    const sql = `
      SELECT
        p.p_id,
        p.user_id,
        p_view_count,
        p_collect_count,
        p_share_count,
        p_comment_count,
        p_content,
        p_images,
        u.user_avatar,
        u.username
      FROM
        post p
      LEFT JOIN
        users u ON p.user_id = u.user_id
      LEFT JOIN
        collection c ON p.p_id = c.p_id AND c.user_id = ?
      WHERE
        p.is_public = 'true'
      ORDER BY
        p.publish_time DESC
      LIMIT ? OFFSET ?`

    const countSql = `select count(*) as total from post where is_public = 'true'`

    try {
      const [list, count] = await Promise.all([
        dbQueryPromise<PostInfo>(db, sql, [userId, limit, offset]),
        dbQueryPromise<PostTotal>(db, countSql),
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

  // 帖子详情接口
  app.get('/post/:post_id', (req, res) => {
    const p_id = req.params.post_id
    const user_id = getNonEssentialAuthUserId(req)

    console.log('当前测试用户id:', user_id)

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
        p.p_id = ?
      AND (
        p.is_public = 'true'
        or 
        p.user_id = ?
      );`

    db.query(sql, [user_id, p_id, user_id], (err, result: PostDetail[]) => {
      if (err) {
        return res.status(500).json({
          code: 1,
          message: '数据库查询错误',
          error: err.message,
        })
      }

      if (result.length === 0) {
        return res.status(404).json({
          code: 2,
          message: '未找到对应帖子或者帖子被作者隐藏',
        })
      }

      res.json({
        code: 0,
        message: '请求成功',
        data: result,
      })
    })
  })

  // 更新浏览数接口
  app.patch('/post/view/:p_id', (req, res) => {
    const { p_id } = req.params

    const getSql = 'SELECT p_view_count FROM post WHERE p_id = ?'

    db.query(getSql, [p_id], (err, result) => {
      if (err) return res.status(500).json({ error: '查询失败' })

      if (result.length === 0) {
        return res.status(404).json({ message: '帖子不存在' })
      }

      const currentViews = +result[0].p_view_count

      const updateSql = 'UPDATE post SET p_view_count = ? WHERE p_id = ?'
      db.query(updateSql, [currentViews + 1, p_id], (err) => {
        if (err) {
          return res.status(500).json({ error: '更新失败' })
        }

        res.json({
          code: 0,
          message: `帖子 ${p_id} 浏览量已更新为 ${currentViews + 1}`,
        })
      })
    })
  })
}
