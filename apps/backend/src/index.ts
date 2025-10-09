import '@configs/env'

import mysql from 'mysql'
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'
import path from 'path'
// import http from 'http'
// import { Server } from 'socket.io'
// import fs from 'fs'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

app.get('/test', (req, res) => {
  res.send('running')
})

// const server = http.createServer(app)

// const io = new Server(server, {
//   cors: {
//     origin: process.env.ORIGIN,
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// })

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

db.connect((err) => {
  if (err) throw err
  console.log('数据库连接成功')
})
