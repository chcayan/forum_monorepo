<script setup lang="ts">
import { getUserInfoAPI } from './api'
import {
  RouterPath,
  getCurrentRoute,
  navigateInterceptor,
  socket,
} from './utils'
import emitter from './utils/eventEmitter'
import { useStatusStore, useUserStore } from '@/stores/index'
import { onLaunch } from '@dcloudio/uni-app'
import { watch } from 'vue'

const statusStore = useStatusStore()
const userStore = useUserStore()

async function initUserStatus() {
  await userStore.getUserInfo()

  socket.emit('login', userStore.userInfo?.user_id)

  socket.on(
    'receiveMessage',
    async ({
      from,
      message,
      is_share,
    }: {
      from: string
      message: string
      is_share: '0' | '1'
    }) => {
      const route = getCurrentRoute()
      if (route === RouterPath.chat) return
      const res = await getUserInfoAPI({ userId: from })
      const userInfo = res.data?.data[0] as userInfo
      console.log(is_share)
      uni.showToast({
        icon: 'none',
        title: `${userInfo.username}: ${is_share === '0' ? message : '分享了帖子'}`,
        position: 'top',
      })
    }
  )

  await userStore.getUserCollectListOfPostId()
  await userStore.getUserFollowList()
  await userStore.getUserFriendList()
}

watch(
  () => userStore.token,
  async () => {
    if (!userStore.token) return
    await initUserStatus()
  }
)

onLaunch(async () => {
  statusStore.initTheme()
  navigateInterceptor()

  emitter.on('API:UN_AUTH', (message: string) => {
    console.log(message)
    uni.showToast({
      icon: 'none',
      title: message,
    })
    if (message === '用户不存在' || message === '用户名或密码错误') {
      return
    }
    userStore.removeToken()
    uni.switchTab({
      url: RouterPath.index,
    })
  })

  emitter.on('API:BAD_REQUEST', (message: string) => {
    uni.showToast({
      icon: 'none',
      title: message,
    })
  })

  if (userStore.token) {
    await initUserStatus()
  }
})
</script>

<style></style>
