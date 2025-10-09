import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = '你的密钥'

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: '未登录' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: '未登录' })

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string }
    req.user = { id: payload.id }
    next()
  } catch {
    res.status(401).json({ message: 'Token 无效' })
  }
}
