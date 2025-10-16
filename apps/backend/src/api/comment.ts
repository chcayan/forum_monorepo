import mysql from 'mysql'
import type { Express } from 'express'
import { authMiddleware } from '@middleware/auth'
import type { CommentList } from '@forum-monorepo/types'

export function registerCommentAPI(app: Express, db: mysql.Connection) {
  // 发送评论接口
  app.post('/post/comments', authMiddleware, (req, res) => {
    const { postId, content } = req.body
    const userId = req.user?.id

    if (!userId || !postId || !content) {
      return res.status(400).json({ error: '参数不完整' })
    }

    const sql =
      'INSERT INTO comments (user_id, p_id, c_content) VALUES (?, ?, ?)'

    db.query(sql, [userId, postId, content], (err) => {
      if (err) {
        return res.status(500).json({ error: '插入失败' })
      }

      res.status(201).json({
        code: 0,
        message: '评论成功',
      })
    })
  })

  // 评论列表接口
  app.get('/post/comments/:postId', (req, res) => {
    const postId = req.params.postId

    const sql = `
      SELECT 
        comment_id, 
        c.user_id, 
        c.p_id, 
        c_content, 
        created_time, 
        u.user_avatar, 
        u.username 
      from 
        comments c 
      LEFT JOIN 
        post p on c.p_id = p.p_id 
      LEFT JOIN 
        users u on c.user_id = u.user_id 
      where 
        c.p_id = ? 
      ORDER BY 
        created_time desc;`

    db.query(sql, [postId], (err, result: CommentList[]) => {
      if (err) {
        return res.status(500).json({
          code: 1,
          message: '数据库查询错误',
          error: err.message,
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
