<script setup lang="ts">
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view class="setting-view" :class="{ theme: statusStore.isDarkMode }">
    setting
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.setting-view {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: $theme-light-color;
}
</style>
