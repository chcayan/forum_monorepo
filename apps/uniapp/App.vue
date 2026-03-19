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

type userInfo = {
  userId: string
  username: string
  userAvatar: string
}

async function initUserStatus() {
  await userStore.getUserInfo()

  socket.emit('login', userStore.userInfo?.userId)

  socket.on('receiveOnlineList', (list: string[]) => {
    userStore.setOnLineList(list)
  })

  socket.on(
    'receiveMessage',
    async ({
      from,
      message,
      isShare,
    }: {
      from: string
      message: string
      isShare: '0' | '1'
    }) => {
      const route = getCurrentRoute()
      if (route === RouterPath.chat) return
      const res = await getUserInfoAPI(from)
      const userInfo = res.data?.data as userInfo

      uni.showToast({
        icon: 'none',
        title: `${userInfo.username}: ${isShare === '0' ? message : '分享了帖子'}`,
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

  emitter.on('API:FORBIDDEN', (message: string) => {
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
