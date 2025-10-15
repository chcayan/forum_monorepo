<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.body.dataset.theme = localStorage.getItem('theme') as
    | string
    | undefined
})
</script>

<template>
  <router-view />
</template>

<style scoped lang="scss"></style>
