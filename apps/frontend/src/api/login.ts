import { request } from '@/utils'

type UserInfo = {
  email: string
  password: string
}

/**
 * 登录
 * @param data 用户邮箱、密码
 * @returns
 */
export function loginAPI(data: UserInfo) {
  return request.post('/login', data)
}

/**
 * 注册
 * @param data 用户邮箱、密码
 * @returns
 */
export function registerAPI(data: UserInfo) {
  return request.post('/register', data)
}
