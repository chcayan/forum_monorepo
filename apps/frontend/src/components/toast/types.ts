export type ColorType = 'normal' | 'success' | 'error'

export type ToastParams = {
  msg: string
  type: ColorType
  duration?: number
  eventFn?: () => void
}
