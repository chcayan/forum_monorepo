export type ColorType = 'normal' | 'success' | 'error'

export type ToastParams = {
  msg: string
  type: ColorType
  duration?: number
  eventFn?: () => void
}

export type ChatToastParams = {
  username: string
  userAvatar: string
  userId: string
  message: string
}
