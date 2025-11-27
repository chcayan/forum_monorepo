import { Server } from 'socket.io'
import type { Express } from 'express'
import mysql from 'mysql'
import { authMiddleware } from '@middleware/auth'
import type { ChatInfo, UnreadInfo } from '@forum-monorepo/types'

export function createSocketConnection(io: Server, db: mysql.Connection) {
  const users: Record<string, string> = {}

  io.on('connection', (socket) => {
    console.log('连接:', socket.id)

    socket.on('login', (username) => {
      users[username] = socket.id
      console.log(`${username} 登录，绑定到 ${socket.id}`)
    })

    socket.on('sendMessage', ({ from, to, message, is_share = '0' }) => {
      db.query(
        'INSERT INTO messages (sender, receiver, content, is_read, is_share) VALUES (?, ?, ?, FALSE, ?)',
        [from, to, message, is_share]
      )

      const toSocketId = users[to]
      if (toSocketId) {
        io.to(toSocketId).emit('receiveMessage', { from, message, is_share })
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
  app.get('/chat/unread', authMiddleware, (req, res) => {
    const userId = req.user?.id
    const sql = `SELECT sender, COUNT(*) AS count FROM messages WHERE receiver = ? AND is_read = FALSE GROUP BY sender`

    db.query(sql, [userId], (err, result: UnreadInfo[]) => {
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

  // ai聊天
  app.post('/chat/ai/chat-mode', authMiddleware, async (req, res) => {
    const { prompt } = req.body

    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

    const apiKey = process.env.API_KEY

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        thinking: {
          type: 'disabled',
        },
        temperature: 0.7,
        max_tokens: 50,
        stream: false,
      }),
    })

    if (!response.ok) console.error('API Error')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await response.json()) as any

    res.json({
      code: 0,
      data: data.choices[0],
    })
  })
}
