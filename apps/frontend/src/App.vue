<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { socket, Toast } from './utils'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from './stores'

const userStore = useUserStore()
watch(
  () => userStore.token,
  () => {
    if (!userStore.token) return
    console.log('token update, get user info')
    userStore.getUserInfo()

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
})
</script>

<template>
  <router-view />
</template>

<style scoped lang="scss"></style>
