import { request, baseURL } from '@/utils'
import axios from 'axios'

export function refreshAPI() {
  return axios
    .create({ baseURL, timeout: 30000, withCredentials: true })
    .post('/auth/refresh-user')
}

/**
 * 检测用户是否被封禁
 * @returns
 */
export function checkIsLoginProhibitAPI() {
  return request.post('/auth/check-login-prohibit')
}
