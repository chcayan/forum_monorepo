export type ColorType = 'normal' | 'success' | 'error'

export type ToastParams = {
  msg: string
  type: ColorType
  duration?: number
  eventFn?: () => void
  confirmText?: string
}

export type ChatToastParams = {
  username: string
  userAvatar: string
  userId: string
  message: string
  isShare: '0' | '1'
}
