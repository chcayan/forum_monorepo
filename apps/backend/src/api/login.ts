import jwt from 'jsonwebtoken'
import mysql from 'mysql'
import bcrypt from 'bcryptjs'
import type { Express } from 'express'

export function registerLoginAPI(app: Express, db: mysql.Connection) {
  // 登录接口
  app.post('/login', (req, res) => {
    const { email, password } = req.body

    const sql = 'select * from users where user_email = ?'

    db.query(sql, [email], async (err, result) => {
      if (err) return res.status(500).json({ message: '数据库查询失败' })

      if (result.length === 0) {
        return res.status(401).json({ message: '用户不存在' })
      }

      const user = result[0]
      const userId = user.user_id

      const isMatch = await bcrypt.compare(password, user.user_password)

      if (!isMatch) {
        return res.status(401).json({ message: '用户名或密码错误' })
      }

      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      })

      res.json({
        code: 0,
        token: token,
      })
    })
  })

  // 注册接口
  app.post('/register', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' })
    }

    try {
      db.query(
        `SELECT * FROM users WHERE user_email = ?`,
        [email],
        async (err, result) => {
          if (err) {
            console.error('查询失败:', err)
            return res.status(500).send('服务器错误')
          }

          if (result.length > 0) {
            return res.status(400).json({ code: 1, message: '邮箱已存在' })
          }

          db.query(
            `SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1`,
            async (err, rows) => {
              if (err) {
                return res.status(500).send('服务器错误')
              }

              let nextId

              if (rows.length === 0) {
                nextId = 'u00000'
              } else {
                const lastId = rows[0].user_id
                const num = parseInt(lastId.slice(1)) + 1
                nextId = `u${num.toString().padStart(5, '0')}`
              }

              const salt = await bcrypt.genSalt(10)
              const hashedPassword = await bcrypt.hash(password, salt)

              const insertSql = `
                  INSERT INTO users (user_id, user_email, username, user_password)
                  VALUES (?, ?, '默认名字', ?)
              `

              db.query(insertSql, [nextId, email, hashedPassword], (err) => {
                if (err) {
                  console.error('插入失败:', err)
                  return res.status(500).send('服务器错误')
                }
                res.status(201).json({ code: 0, message: '注册成功' })
              })
            }
          )
        }
      )
    } catch (error) {
      console.error('注册失败:', error)
      res.status(500).send('服务器错误')
    }
  })
}
