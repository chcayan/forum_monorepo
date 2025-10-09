import { PostInfo, PostTotal } from '@forum-monorepo/types'
import type { Express } from 'express'
import mysql from 'mysql'

export function registerPostAPI(db: mysql.Connection, app: Express) {
  // 帖子列表接口
  function dbQueryPromise<T>(
    sql: string,
    value?: (string | number | null)[]
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      db.query(sql, value, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  }

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
        dbQueryPromise<PostInfo>(sql, [userId, limit, offset]),
        dbQueryPromise<PostTotal>(countSql),
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
  app.post('/post/detail', (req, res) => {
    const { p_id, user_id } = req.body
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
        p.p_id = ?`

    db.query(sql, [user_id, p_id], (err, result) => {
      if (err) {
        console.error('数据库查询错误:', err)
        return res.status(500).json({
          code: 1,
          message: '数据库查询错误',
          error: err.message,
        })
      }

      if (result.length === 0) {
        return res.status(404).json({
          code: 2,
          message: '未找到对应id的post',
        })
      }

      res.json({
        code: 0,
        message: '请求成功',
        data: result,
      })
    })
  })
}
