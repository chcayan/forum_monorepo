import { useUserStore } from '@/stores'

/**
 * 检查登录状态，并弹窗提示(可选是否跳转到登录页)
 * @param eventFn 事件函数
 * @returns
 */
export function checkLoginStatus() {
  const userStore = useUserStore()
  if (!userStore.token) {
    uni.showToast({
      icon: 'none',
      title: '未登录，请先登录',
    })
    return false
  }
  return true
}
