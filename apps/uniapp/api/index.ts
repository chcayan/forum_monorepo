import { request } from '@/utils'

export * from './post'
export * from './chat'
export * from './comment'
export * from './login'
export * from './user'

export function testAPI() {
  return request.get('/test')
}
