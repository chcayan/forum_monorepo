import { request } from '@/utils'

export function refreshAPI() {
  return request.post('/auth/refresh-user')
}

/**
 * 检测用户是否被封禁
 * @returns
 */
export function checkIsLoginProhibitAPI() {
  return request.post('/auth/check-login-prohibit')
}
