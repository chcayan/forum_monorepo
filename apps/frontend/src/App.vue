<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { ChatToast, socket, Toast } from './utils'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from './stores'
import router, { RouterPath } from './router'
import { useRoute } from 'vue-router'
import { getUserInfoAPI } from './api'
import { useStatusStore } from './stores/modules/status'

const userStore = useUserStore()
const route = useRoute()
type userInfo = {
  user_id: string
  username: string
  user_avatar: string
}
async function initUserStatus() {
  await userStore.getUserInfo()

  // websocket
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
      if (route.path.startsWith(RouterPath.chat)) return
      const res = await getUserInfoAPI({ userId: from })
      const userInfo = res.data?.data[0] as userInfo
      ChatToast.show({
        userId: userInfo.user_id,
        userAvatar: userInfo.user_avatar,
        username: userInfo.username,
        message,
        is_share,
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

// api
emitter.on('API:UN_AUTH', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
  userStore.removeToken()
})

emitter.on('API:BAD_REQUEST', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
  if (
    route.path.startsWith(RouterPath.chat) ||
    route.path.startsWith(RouterPath.publish) ||
    route.path.startsWith(RouterPath.my)
  ) {
    router.push(RouterPath.base)
  }
})

const statusStore = useStatusStore()
onMounted(async () => {
  // 主题
  document.body.dataset.theme = statusStore.currentTheme

  if (userStore.token) {
    await initUserStatus()
  }

  window.addEventListener('offline', () => {
    Toast.show({
      msg: '不知道谁的网络出现了点问题😢',
      type: 'error',
    })
  })

  window.addEventListener('online', () => {
    Toast.show({
      msg: '满血复活😊',
      type: 'success',
    })
  })

  let lastTime = 0
  window.addEventListener('scroll', () => {
    const now = Date.now()
    if (now - lastTime > 500) {
      emitter.emit('TAB:CLOSE_AVATAR_WIDGET')
      lastTime = now
    }
  })
})
</script>

<template>
  <router-view />
</template>

<style scoped lang="scss"></style>
