import { Server } from 'socket.io'
import type { Express } from 'express'
import mysql from 'mysql'
import { authMiddleware } from '@middleware/auth'
import { ChatInfo, UnreadInfo } from '@forum-monorepo/types'

export function createSocketConnection(io: Server, db: mysql.Connection) {
  const users: Record<string, string> = {}

  io.on('connection', (socket) => {
    console.log('连接:', socket.id)

    socket.on('login', (username) => {
      users[username] = socket.id
      console.log(`${username} 登录，绑定到 ${socket.id}`)
    })

    socket.on('sendMessage', ({ from, to, message }) => {
      db.query(
        'INSERT INTO messages (sender, receiver, content, is_read) VALUES (?, ?, ?, FALSE)',
        [from, to, message]
      )

      const toSocketId = users[to]
      if (toSocketId) {
        io.to(toSocketId).emit('receiveMessage', { from, message })
      }
    })

    socket.on('disconnect', () => {
      for (const username in users) {
        if (users[username] === socket.id) {
          delete users[username]
          console.log(`${username} 断开连接`)
          break
        }
      }
    })
  })
}

export function registerChatAPI(app: Express, db: mysql.Connection) {
  // 获取聊天记录接口
  app.get('/chat/history', authMiddleware, (req, res) => {
    const { followId } = req.query
    const userId = req.user?.id

    const sql = `SELECT * FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY created_at`

    db.query(
      sql,
      [userId, followId, followId, userId],
      (err, result: ChatInfo[]) => {
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
      }
    )
  })

  // 获取未读消息数量接口
  app.get('/chat/unread/:followId', authMiddleware, (req, res) => {
    const { followId } = req.params
    const sql = `SELECT sender, COUNT(*) AS count FROM messages WHERE receiver = ? AND is_read = FALSE GROUP BY sender`

    db.query(sql, [followId], (err, result: UnreadInfo[]) => {
      if (err) {
        console.error('查询失败: ', err)
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

  // 标记为已读接口
  app.post('/chat/mark-as-read', authMiddleware, (req, res) => {
    const { from } = req.body
    const to = req.user?.id
    const sql =
      'UPDATE messages SET is_read = TRUE WHERE sender = ? AND receiver = ? AND is_read = FALSE'

    db.query(sql, [from, to], (err) => {
      if (err) {
        return res.status(500).json({
          code: 1,
          message: '更新失败',
          error: err.message,
        })
      }

      res.json({
        code: 0,
        message: '成功标记为已读',
      })
    })
  })
}
