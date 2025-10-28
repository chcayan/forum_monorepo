import { useUserStore } from '@/stores'
import { Toast } from '@/utils'
import { createRouter, createWebHistory } from 'vue-router'

class RouterPath {
  static base: string = '/'
  static post: string = '/post'
  static chat: string = '/chat'
  static publish: string = '/publish'
  static login: string = '/login'
  static user: string = '/user'
  static setting: string = '/setting'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: RouterPath.base,
      component: () => import('@/views/layout/LayoutView.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/post/PostView.vue'),
        },
        {
          path: `${RouterPath.post}/:postId`,
          component: () => import('@/views/post/PostDetail.vue'),
        },
        {
          path: RouterPath.chat,
          component: () => import('@/views/chat/ChatView.vue'),
          meta: { requireAuth: true },
        },
        {
          path: RouterPath.publish,
          component: () => import('@/views/post/PublishView.vue'),
          meta: { requireAuth: true },
        },
        {
          path: RouterPath.login,
          component: () => import('@/views/login/LoginView.vue'),
        },
        {
          path: RouterPath.user,
          component: () => import('@/views/user/UserView.vue'),
          meta: { requireAuth: true },
        },
        {
          path: RouterPath.setting,
          component: () => import('@/views/setting/SettingView.vue'),
        },
        {
          path: '/:pathMatch(.*)*',
          component: () => import('@/views/notfound/NotfoundView.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.token && to.path !== RouterPath.login && to.meta.requireAuth) {
    return { path: RouterPath.login, query: { redirect: to.path } }
  }
  if (userStore.token && to.path.startsWith(RouterPath.login)) {
    Toast.show({
      msg: '您已登录，不要手动跳到登录页哦😊',
      type: 'error',
    })
    return RouterPath.base
  }
  return true
})

export { RouterPath }
export default router
