import '@configs/env'

import mysql from 'mysql'
import path from 'path'
import http from 'http'
import { Server } from 'socket.io'
import express from 'express'
import cors from 'cors'
import {
  createSocketConnection,
  registerChatAPI,
  registerCommentAPI,
  registerLoginAPI,
  registerPostAPI,
  registerUserAPI,
} from './api/index'
import { authMiddleware } from '@middleware/auth'

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
)

app.get('/test', authMiddleware, (req, res) => {
  res.send('running')
})

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(express.json())
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

// database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
})

db.connect((err) => {
  if (err) throw err
  console.log('数据库连接成功')
})

// API
registerPostAPI(app, db)
registerLoginAPI(app, db)
registerCommentAPI(app, db)
registerUserAPI(app, db)
registerChatAPI(app, db)

// websocket
createSocketConnection(io, db)

server.listen(process.env.PORT, () => {
  console.log(`\n服务器运行在${process.env.ORIGIN}`)
})
