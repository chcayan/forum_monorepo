<script setup lang="ts">
import router, { RouterPath } from '@/router'
import { checkLoginStatus } from '@/utils'

function navigateToLogin() {
  router.push(RouterPath.login)
}

const follow = () => {
  if (!checkLoginStatus(navigateToLogin)) return
  console.log(666)
}
</script>

<template>
  <button @click="follow">关注</button>
</template>

<style scoped lang="scss">
button {
  width: 50px;
  height: 32px;
  border-radius: $gap;
  background-color: var(--theme-button-color);
}
</style>
