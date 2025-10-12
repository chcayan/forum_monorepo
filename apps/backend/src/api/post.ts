import { PostDetail, PostInfo, PostTotal } from '@forum-monorepo/types'
import type { Express } from 'express'
import mysql from 'mysql'
import { dbQueryPromise, getNonEssentialAuthUserId } from './index'
import { upload } from '@configs/upload'
import { authMiddleware } from '@middleware/auth'

export function registerPostAPI(app: Express, db: mysql.Connection) {
  // 帖子列表接口
  app.get('/post', async (req, res) => {
    const userId = getNonEssentialAuthUserId(req)
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
  app.get('/post/:postId', (req, res) => {
    const postId = req.params.postId
    const userId = getNonEssentialAuthUserId(req)

    console.log('当前测试用户id:', userId)

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

    db.query(sql, [userId, postId, userId], (err, result: PostDetail[]) => {
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
  app.patch('/post/view/:postId', (req, res) => {
    const { postId } = req.params

    const getSql = 'SELECT p_view_count FROM post WHERE p_id = ?'

    db.query(getSql, [postId], (err, result) => {
      if (err) return res.status(500).json({ error: '查询失败' })

      if (result.length === 0) {
        return res.status(404).json({ message: '帖子不存在' })
      }

      const currentViews = +result[0].p_view_count

      const updateSql = 'UPDATE post SET p_view_count = ? WHERE p_id = ?'
      db.query(updateSql, [currentViews + 1, postId], (err) => {
        if (err) {
          return res.status(500).json({ error: '更新失败' })
        }

        res.json({
          code: 0,
          message: `帖子 ${postId} 浏览量已更新为 ${currentViews + 1}`,
        })
      })
    })
  })

  // 发送帖子接口
  app.post(
    '/post/publish',
    authMiddleware,
    upload.array('postImages', 9),
    (req, res) => {
      const { content, isPublic } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(400).send('用户ID为空')
      }
      if (!content) {
        return res.status(400).send('内容为空')
      }

      const files = req.files as Express.Multer.File[]

      const imagePath = files?.map((file) => `/uploads/${file.filename}`) || []

      const images = JSON.stringify(imagePath)

      db.query(
        `SELECT p_id FROM post ORDER BY p_id DESC LIMIT 1`,
        async (err, rows) => {
          if (err) {
            console.error('查询最大ID失败:', err)
            return res.status(500).send('服务器错误')
          }

          let nextId

          if (rows.length === 0) {
            nextId = 'p00000'
          } else {
            const lastId = rows[0].p_id
            const num = parseInt(lastId.slice(1)) + 1
            nextId = `p${num.toString().padStart(5, '0')}`
          }

          const insertSql = `
              INSERT INTO post (p_id, user_id, p_content, p_images, is_public)
              VALUES (?, ?, ?, ?, ?)
          `

          db.query(
            insertSql,
            [nextId, userId, content, images, isPublic],
            (err) => {
              if (err) {
                console.error('发布失败:', err)
                return res.status(500).send('服务器错误')
              }
              res.status(201).json({ code: 0, message: '发布成功' })
            }
          )
        }
      )
    }
  )

  // 搜索接口
  app.get('/post/search', (req, res) => {
    const { result } = req.query
    const userId = getNonEssentialAuthUserId(req)

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
        user_avatar, 
        username 
      FROM 
        post p 
      left join 
        users u on p.user_id = u.user_id 
      LEFT JOIN 
        collection c ON p.p_id = c.p_id 
      AND 
        c.user_id = ? 
      where 
        is_public = 'true' 
      and 
        p_content LIKE ? 
      order by 
        publish_time desc;`

    const formatSearchContent = `%${result}%`

    db.query(sql, [userId, formatSearchContent], (err, result: PostInfo[]) => {
      if (err) {
        console.error('查询错误: ', err)
        return res.status(500).json({
          code: 1,
          message: '查询错误',
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
