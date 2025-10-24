import { useUserStore } from '@/stores'
import { Toast } from './toast'

/**
 * 检查登录状态，并弹窗提示(可选是否跳转到登录页)
 * @param eventFn 事件函数
 * @returns
 */
export function checkLoginStatus(eventFn?: () => void) {
  const userStore = useUserStore()
  if (!userStore.token) {
    Toast.show({
      msg: '未登录，请先登录',
      type: 'error',
      duration: eventFn ? 5000 : 2000,
      ...(eventFn ? { eventFn } : {}),
    })
    return false
  }
  return true
}
