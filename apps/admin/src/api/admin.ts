import { request } from '@/utils'

/**
 * 管理员信息 (登录管理员填写 'self') - 数据结构：UserInfo[]
 * @param userId 管理员id
 * @returns
 */
export function getAdminInfoAPI(userId: string) {
  return request.get(`/user/${userId}`)
}

type AdminLogin = {
  email: string
  password: string
}

/**
 * 登录
 * @param data 管理员邮箱、密码
 * @returns
 */
export function loginAPI(data: AdminLogin) {
  return request.post('/admin/login', data)
}

export function getUnAuditPostAPI(page: number, limit: number) {
  return request.get(`/admin/post?page=${page}&limit=${limit}`)
}
