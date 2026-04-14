import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

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
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = { id: payload.id }
    next()
  } catch {
    res.status(401).json({ message: '登录状态过期，请重新登录' })
  }
}
