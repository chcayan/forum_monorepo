<script setup lang="ts">
// #ifdef MP-WEIXIN
import { onShow } from '@dcloudio/uni-app'
import { navigateInterceptor } from '@/utils'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
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
