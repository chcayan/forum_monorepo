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
  static chat: string = '/pages/chat/chat'
  static publish: string = '/pages/publish/publish'
  static login: string = '/pages/login/login'
  static my: string = '/pages/my/my'
  static user: string = '/pages/my/user/user'
  static setting: string = '/pages/setting/setting'
  static notFound: string = '/pages/index/notfound/notfound'
  static edit: string = '/pages/my/edit/edit'
  static search: string = '/pages/index/search/search'
}

export { RouterPath }
