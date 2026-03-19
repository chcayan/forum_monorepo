import { baseUrl, request } from '@/utils'

export function refreshAPI() {
  return uni.request({
    url: `${baseUrl}/auth/refresh-user`,
    method: 'POST',
    withCredentials: true,
    timeout: 30000,
  })
}

/**
 * 检测用户是否被封禁
 * @returns
 */
export function checkIsLoginProhibitAPI() {
  return request.post('/auth/check-login-prohibit')
}
