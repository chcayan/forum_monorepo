<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { socket, Toast } from './utils'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from './stores'
import router, { RouterPath } from './router'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()

watch(
  () => userStore.token,
  async () => {
    if (!userStore.token) return
    console.log('token update, get user info')
    await userStore.getUserInfo()

    // websocket
    socket.emit('login', userStore.userInfo?.user_id)

    socket.on(
      'receiveMessage',
      async ({ from, message }: { from: string; message: string }) => {
        Toast.show({
          msg: `来自${from}的消息：${message}`,
          type: 'success',
        })
      }
    )

    await userStore.getUserCollectListOfPostId()
    await userStore.getUserFollowList()
    await userStore.getUserFriendList()
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

onMounted(async () => {
  // 主题
  document.body.dataset.theme = localStorage.getItem('theme') as
    | string
    | undefined

  if (userStore.token) {
    await userStore.getUserInfo()
    socket.emit('login', userStore.userInfo?.user_id)
    socket.on(
      'receiveMessage',
      ({ from, message }: { from: string; message: string }) => {
        if (route.path.startsWith(RouterPath.chat)) return
        Toast.show({
          msg: `来自${from}的消息：${message}`,
          type: 'success',
        })
      }
    )

    await userStore.getUserCollectListOfPostId()
    await userStore.getUserFollowList()
    await userStore.getUserFriendList()
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
