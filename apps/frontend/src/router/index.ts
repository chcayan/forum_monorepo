import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/layout/LayoutView.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/post/PostView.vue'),
        },
        {
          path: '/chat',
          component: () => import('@/views/chat/ChatView.vue'),
        },
        {
          path: '/publish',
          component: () => import('@/views/post/PublishView.vue'),
        },
        {
          path: '/login',
          component: () => import('@/views/login/LoginView.vue'),
        },
        {
          path: '/user',
          component: () => import('@/views/user/UserView.vue'),
        },
        {
          path: '/setting',
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

export default router
