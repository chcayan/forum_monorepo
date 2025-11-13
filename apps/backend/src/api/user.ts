import mysql, { FieldInfo } from 'mysql'
import type { Express } from 'express'
import type {
  FriendInfo,
  PostDetail,
  PostTotal,
  UserBySearchInfo,
  UserInfo,
} from '@forum-monorepo/types'
import { dbQueryPromise, getNonEssentialAuthUserId } from './index'
import { upload } from '@configs/upload'
import { authMiddleware } from '@middleware/auth'

interface MulterField {
  name: string
}

const fields: MulterField[] = [{ name: 'avatar' }, { name: 'bgImg' }]

export function registerUserAPI(app: Express, db: mysql.Connection) {
  // 用户信息接口
  app.post('/user/info', (req, res) => {
    const userId = req.body?.userId || getNonEssentialAuthUserId(req)

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

    db.query(sql, [userId], (err, result: UserInfo[]) => {
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
    const { creatorUserId } = req.body
    const page = parseInt(req.body.page) || 1
    const limit = parseInt(req.body.limit) || 10
    const offset = (page - 1) * limit
    const userId = getNonEssentialAuthUserId(req)

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
        is_public,
        publish_time
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
          userId,
          creatorUserId,
          limit,
          offset,
        ]),
        dbQueryPromise<PostTotal>(db, countSql, [userId, creatorUserId]),
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

  // 用户信息更新接口
  app.post(
    '/user/update',
    authMiddleware,
    upload.fields(fields),
    (req, res) => {
      const { username, sex, signature } = req.body
      const userId = req.user?.id
      const files = req.files as Record<string, Express.Multer.File[]>

      const avatarPaths = []
      const bgImgPaths = []
      if (files?.avatar) {
        avatarPaths.push(`/uploads/${files.avatar[0]?.filename}`)
      }

      if (files?.bgImg) {
        bgImgPaths.push(`/uploads/${files.bgImg[0]?.filename}`)
      }

      let sql = 'UPDATE users SET username = ?, sex = ?, signature = ?,'
      const values = [username, sex, signature]

      if (avatarPaths[0]) {
        sql += ' user_avatar = ?,'
        values.push(avatarPaths[0])
      }

      if (bgImgPaths[0]) {
        sql += ' background_img = ?,'
        values.push(bgImgPaths[0])
      }

      sql = sql.replace(/,$/, '')
      sql += ' WHERE user_id = ?'
      values.push(userId)

      db.query(sql, values, (err) => {
        if (err) {
          return res.status(500).json({ code: 1, msg: '更新失败' })
        }
        res.json({ code: 0, msg: '更新成功' })
      })
    }
  )

  // 用户收藏帖子信息接口
  app.post('/user/collect', async (req, res) => {
    const { creatorUserId } = req.body
    const userId = getNonEssentialAuthUserId(req)
    const page = parseInt(req.body.page) || 1
    const limit = parseInt(req.body.limit) || 10
    const offset = (page - 1) * limit

    const sql = `
      SELECT 
        p.p_id, 
        p.user_id, 
        p.p_view_count, 
        p.p_collect_count, 
        p.p_share_count, 
        p.p_comment_count, 
        p.p_content, 
        p.p_images, 
        u.user_avatar, 
        u.username, 
        p.is_public,
        publish_time
      FROM 
        collection c 
      LEFT JOIN 
        post p ON c.p_id = p.p_id 
      LEFT JOIN 
        users u ON p.user_id = u.user_id 
      LEFT JOIN 
        collection c2 ON c2.p_id = c.p_id AND c2.user_id = ?
      WHERE 
        c.user_id = ?
      AND (
        p.is_public = 'true'
        OR p.user_id = ?
      )
      ORDER BY 
        c.collect_time DESC
      LIMIT ? 
      OFFSET ?`

    const countSql = `
      select 
        count(*) as total 
      FROM 
        collection c 
      LEFT JOIN 
        post p ON c.p_id = p.p_id 
      LEFT JOIN 
        users u ON p.user_id = u.user_id 
      LEFT JOIN 
        collection c2 ON c2.p_id = c.p_id AND c2.user_id = ?
      WHERE 
        c.user_id = ?
      AND (
        p.is_public = 'true'
        OR p.user_id = ?
      );`

    try {
      const [list, count] = await Promise.all([
        dbQueryPromise<PostDetail>(db, sql, [
          userId,
          creatorUserId,
          userId,
          limit,
          offset,
        ]),
        dbQueryPromise<PostTotal>(db, countSql, [
          userId,
          creatorUserId,
          userId,
        ]),
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

  // 用户收藏帖子p_id数组接口
  app.post('/user/collect/postId', authMiddleware, (req, res) => {
    const { creatorUserId } = req.body
    const userId = req.user?.id

    const sql = `
      SELECT 
        c.p_id
      FROM 
        collection c
      JOIN 
        post p ON c.p_id = p.p_id
      WHERE 
        c.user_id = ?
      AND 
        (p.is_public = 'true' OR p.user_id = ?);`

    db.query(sql, [creatorUserId, userId], (err, result: string[]) => {
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

  // 用户添加收藏接口
  app.post('/user/collect/add', authMiddleware, (req, res) => {
    const { postId } = req.body
    const userId = req.user?.id

    // 检查数据是否完整
    if (!userId || !postId) {
      return res.status(400).json({ error: '参数不完整' })
    }

    const sql = 'INSERT INTO collection (user_id, p_id) VALUES (?, ?)'
    const values = [userId, postId]

    db.query(sql, values, (err) => {
      if (err) {
        return res.status(500).json({ error: '插入失败' })
      }

      res.status(201).json({
        code: 0,
        message: '收藏成功',
      })
    })
  })

  // 用户取消收藏接口
  app.delete('/user/collect/del', authMiddleware, (req, res) => {
    const { postId } = req.body
    const userId = req.user?.id

    if (!postId) {
      return res.status(400).json({ error: '未找到该帖子' })
    }

    const sql = 'delete from collection where user_id = ? and p_id = ?'
    const values = [userId, postId]

    db.query(sql, values, (err) => {
      if (err) {
        return res.status(500).json({ error: '取消收藏失败' })
      }

      res.status(201).json({
        code: 0,
        message: '取消收藏成功',
      })
    })
  })

  // 用户删除帖子接口
  app.delete('/user/post/del', authMiddleware, (req, res) => {
    const { postId } = req.body
    const userId = req.user?.id

    if (!postId) {
      return res.status(400).json({ error: '未找到该帖子' })
    }

    const sql = 'delete from post where user_id = ? and p_id = ?'
    const values = [userId, postId]

    db.query(sql, values, (err) => {
      if (err) {
        return res.status(500).json({ error: '删除失败' })
      }

      res.status(201).json({
        code: 0,
        message: '删除成功',
      })
    })
  })

  // 用户设置帖子公开
  app.patch('/user/post/public', authMiddleware, (req, res) => {
    const { postId } = req.body

    const sql = `update post set is_public = 'true' where p_id = ?`

    db.query(sql, [postId], (err) => {
      if (err) {
        return res.status(500).json({ error: '更新失败' })
      }

      res.json({
        code: 0,
        message: '公开成功',
      })
    })
  })

  // 用户设置帖子非公开
  app.patch('/user/post/private', authMiddleware, (req, res) => {
    const { postId } = req.body

    const sql = `update post set is_public = 'false' where p_id = ?`

    db.query(sql, [postId], (err) => {
      if (err) {
        return res.status(500).json({ error: '更新失败' })
      }

      res.json({
        code: 0,
        message: '取消公开成功',
      })
    })
  })

  // 用户好友接口
  app.get('/user/friend', authMiddleware, (req, res) => {
    const userId = req.user?.id

    const sql = `
      SELECT
        f1.user_id,
        f1.follow_id,
        u.username,
        u.user_avatar
      FROM
        follows f1
      INNER JOIN
        follows f2 ON f1.follow_id = f2.user_id 
        AND f2.follow_id = ?
      LEFT JOIN
        users u ON f1.follow_id = u.user_id
      WHERE
        f1.user_id = ?`

    db.query(sql, [userId, userId], (err, result: FriendInfo[]) => {
      if (err) {
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

  // 用户添加关注接口
  app.post('/user/follow/add', authMiddleware, (req, res) => {
    const { followId } = req.body
    const userId = req.user?.id

    const sql = `insert into follows(user_id, follow_id)
value (?, ?)`

    db.query(sql, [userId, followId], (err) => {
      if (err) {
        console.error('添加失败: ', err)
        return res.status(500).json({
          code: 1,
          message: '添加失败',
          error: err.message,
        })
      }

      res.json({
        code: 0,
        message: '添加成功',
      })
    })
  })

  // 用户取消关注接口
  app.delete('/user/follow/del', authMiddleware, (req, res) => {
    const { followId } = req.body
    const userId = req.user?.id

    const sql = `delete from follows where user_id = ? and follow_id = ?`

    db.query(sql, [userId, followId], (err) => {
      if (err) {
        console.error('删除失败: ', err)
        return res.status(500).json({
          code: 1,
          message: '删除失败',
          error: err.message,
        })
      }

      res.json({
        code: 0,
        message: '删除成功',
      })
    })
  })

  // 搜索用户接口
  app.get('/user/search', async (req, res) => {
    const { username } = req.query

    const sql = `SELECT username, user_avatar, user_id FROM users WHERE username like ?`

    const formatSearchContent = `%${username}%`

    db.query(
      sql,
      [formatSearchContent],
      async (err, result: UserBySearchInfo[]) => {
        if (err) return res.status(500).send('数据库查询失败')

        res.json({
          code: 0,
          message: '查询成功',
          data: result,
        })
      }
    )
  })

  // 用户关注接口
  app.get('/user/follows', (req, res) => {
    const { userId } = req.query

    const sql = `
      select 
        f.user_id, 
        follow_id, 
        username, 
        user_avatar 
      from 
        follows f 
      LEFT JOIN 
        users u on follow_id = u.user_id 
      where 
        f.user_id = ?`

    db.query(sql, [userId], (err, result: FriendInfo[]) => {
      if (err) {
        return res.status(500).json({
          code: 1,
          message: '查询失败',
          error: err.message,
        })
      }

      res.json({
        code: 0,
        message: '查询成功',
        data: result,
      })
    })
  })

  // 用户粉丝接口
  app.get('/user/fans', (req, res) => {
    const { userId } = req.query

    const sql = `
      select 
        f.user_id, 
        follow_id, 
        username, 
        user_avatar 
      from 
        follows f 
      LEFT JOIN 
        users u on f.user_id = u.user_id 
      where 
        f.follow_id = ?`

    db.query(sql, [userId], (err, result: FieldInfo[]) => {
      if (err) {
        return res.status(500).json({
          code: 1,
          message: '查询失败',
          error: err.message,
        })
      }

      res.json({
        code: 0,
        message: '查询成功',
        data: result,
      })
    })
  })
}
