import { request } from '@/utils'

export function refreshAPI() {
  return request.post('/auth/refresh-admin')
}
