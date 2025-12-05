<script setup lang="ts">
import loadingIcon from '@/static/icon/loading.png'
</script>

<template>
  <view class="loading">
    <image :src="loadingIcon" class="icon" mode="aspectFit" />
  </view>
</template>

<style scoped lang="scss">
.loading {
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;

  .icon {
    width: 80px;
    height: 60px;
  }
}
</style>
