<script setup lang="ts">
import { onMounted } from 'vue'
import { socket } from './utils'

onMounted(() => {
  document.body.dataset.theme = localStorage.getItem('theme') as
    | string
    | undefined

  socket.emit('login', '555')
})
</script>

<template>
  <router-view />
</template>

<style scoped lang="scss"></style>
