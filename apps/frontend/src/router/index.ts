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
        },
        {
          path: RouterPath.publish,
          component: () => import('@/views/post/PublishView.vue'),
        },
        {
          path: RouterPath.login,
          component: () => import('@/views/login/LoginView.vue'),
        },
        {
          path: RouterPath.user,
          component: () => import('@/views/user/UserView.vue'),
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
})

export { RouterPath }
export default router
