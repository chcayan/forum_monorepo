import mysql from 'mysql'
import jwt, { JwtPayload } from 'jsonwebtoken'
import type { Request } from 'express'

/**
 * 使用 Promise 封装 MySQL 查询函数
 * @template T 查询结果的类型
 * @param db MySQL 数据库连接对象
 * @param sql 要执行的 SQL 查询语句
 * @param value 可选的参数数组，用于 SQL 占位符替换
 * @returns 返回一个 Promise
 */
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

/**
 * 获取 user_id，适用于 user_id 可为空，且无需使用 token 鉴权
 * @param req request 参数
 * @returns 返回 user_id 或 null
 */
export function getNonEssentialAuthUserId(req: Request): string | null {
  let user_id: string | null = null
  const authHeader = req.headers['authorization']
  if (authHeader) {
    const token = authHeader.split(' ')[1] as string
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
      user_id = payload.id
    } catch {
      return user_id
    }
  }
  return user_id
}

export * from './post'
export * from './comment'
export * from './user'
export * from './login'
export * from './chat'
