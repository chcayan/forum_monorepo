<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { socket, Toast } from './utils'
import emitter from '@/utils/eventEmitter'
import { usePostStore, useUserStore } from './stores'

const userStore = useUserStore()
const postStore = usePostStore()

watch(
  () => userStore.token,
  async () => {
    if (!userStore.token) return
    console.log('token update, get user info')
    await userStore.getUserInfo()
    await postStore.getUserCollectListOfPostId()

    // websocket
    socket.emit('login', userStore.userInfo?.user_id)
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
})

onMounted(() => {
  // 主题
  document.body.dataset.theme = localStorage.getItem('theme') as
    | string
    | undefined

  if (userStore.token) {
    postStore.getUserCollectListOfPostId()
    console.log('get collect')
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
