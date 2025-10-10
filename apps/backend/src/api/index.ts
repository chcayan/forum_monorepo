import mysql from 'mysql'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request } from 'express'

export function dbQueryPromise<T>(
  db: mysql.Connection,
  sql: string,
  value?: (string | number | null)[]
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.query(sql, value, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export function getNonEssentialAuthUserId(req: Request): string | null {
  let user_id: string | null = null
  const authHeader = req.headers['authorization']
  if (authHeader) {
    const token = authHeader.split(' ')[1] as string
    try {
      const payload = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload
      user_id = payload.id
    } catch {
      console.log('no token')
    }
  }
  return user_id
}

export * from './post'
export * from './comment'
export * from './user'
export * from './login'
