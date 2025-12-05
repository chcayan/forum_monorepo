<script setup lang="ts">
import { useStatusStore } from '@/stores/index'
const statusStore = useStatusStore()

// #ifdef MP-WEIXIN
import { onShow } from '@dcloudio/uni-app'
import { navigateInterceptor } from '@/utils'

onShow(() => {
  navigateInterceptor()
})
// #endif
</script>

<template>
  <view class="chat-view" :class="{ theme: statusStore.isDarkMode }">
    chat
  </view>
</template>

<style lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.chat-view {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: $theme-light-color;
}
</style>
