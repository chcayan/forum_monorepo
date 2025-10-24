<script setup lang="ts">
import { onMounted } from 'vue'
import { socket, Toast } from './utils'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from './stores'

const userStore = useUserStore()

// websocket
socket.emit('login', '555')

// api
emitter.on('API:UN_AUTH', () => {
  Toast.show({
    msg: '登录状态失效，请重新登录',
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
