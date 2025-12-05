export const getCurrentRoute = () => {
  const pages = getCurrentPages()
  if (!pages) return
  const currentPage = pages[pages.length - 1]
  if (!currentPage) return
  const currentRoute = `/${currentPage.route}`
  return currentRoute
}

class RouterPath {
  static index: string = '/pages/index/index'
  static detail: string = '/pages/index/detail/detail'
  static search: string = '/pages/index/search/search'

  static chat: string = '/pages/chat/chat'
  static publish: string = '/pages/publish/publish'
  static login: string = '/pages/login/login'
  static my: string = '/pages/my/my'
  static user: string = '/pages/user/user'
  static setting: string = '/pages/setting/setting'
  static notFound: string = '/pages/notfound/notfound'
}

export { RouterPath }
