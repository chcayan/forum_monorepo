import { RouterPath, getCurrentRoute } from './path'

const authPages = [RouterPath.my, RouterPath.chat, RouterPath.publish]

function needAuth(url: string) {
  if (!url) return
  return authPages.some((page) => url.startsWith(page))
}

function checkLogin() {
  const token = uni.getStorageSync('token')
  return !!token
}

export function navigateInterceptor() {
  const methods = ['navigateTo', 'switchTab', 'redirectTo', 'reLaunch']

  methods.forEach((method) => {
    uni.addInterceptor(method, {
      invoke(e) {
        const url = e.url || e

        if (needAuth(url) && !checkLogin()) {
          uni.navigateTo({
            url: RouterPath.login,
          })
          return false
        }
        return true
      },
      fail(err) {
        console.log(method + '调用失败:', err)
      },
    })
  })

  // #ifdef MP-WEIXIN
  const currentRoute = getCurrentRoute() as string

  if (needAuth(currentRoute) && !checkLogin()) {
    uni.redirectTo({
      url: RouterPath.login,
    })
  }
  // #endif
}
