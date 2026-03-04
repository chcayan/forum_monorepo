<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { ChatToast, socket, Toast } from './utils'
import emitter from '@/utils/eventEmitter'
import { useUserStore, useStatusStore } from './stores'
import router, { RouterPath } from './router'
import { useRoute } from 'vue-router'
import { checkIsLoginProhibit, getUserInfoAPI } from './api'

const userStore = useUserStore()
const route = useRoute()

type userInfo = {
  userId: string
  username: string
  userAvatar: string
}

async function initUserStatus() {
  await checkIsLoginProhibit()
  await userStore.getUserInfo()

  // websocket
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
      if (route.path.startsWith(RouterPath.chat)) return
      const res = await getUserInfoAPI(from)
      const userInfo = res.data?.data as userInfo
      ChatToast.show({
        userId: userInfo.userId,
        userAvatar: userInfo.userAvatar,
        username: userInfo.username,
        message,
        isShare,
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

emitter.on('API:FORBIDDEN', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
})

emitter.on('API:NOT_FOUND', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
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
