/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserEventItem = {
  event: 'post_browse'
  time: number
  page: string
  userId?: string
  data?: any
}

export type ErrorEventItem = {
  event: 'js_error' | 'promise_error' | 'resource_error' | 'vue_error'
  time: number
  userId?: string
  data?: any
}
