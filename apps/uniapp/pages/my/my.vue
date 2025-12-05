<script setup lang="ts">
import { useStatusStore } from '@/stores'
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
  <view class="my-view" :class="{ theme: statusStore.isDarkMode }"> my </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.my-view {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: $theme-light-color;
}
</style>
