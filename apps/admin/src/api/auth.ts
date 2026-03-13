import { request } from '@/utils'
import axios from 'axios'

export function refreshAPI() {
  return axios
    .create({ baseURL: '/api', timeout: 30000, withCredentials: true })
    .post('/auth/refresh-admin')
}

/**
 * 检测用户是否被封禁（这里用于检测用户身份是否过期）
 * @returns
 */
export function checkIsLoginProhibitAPI() {
  return request.post('/auth/check-login-prohibit')
}
