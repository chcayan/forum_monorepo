<script setup lang="ts">
import closeLightIcon from '@/static/icon/close_light.png'
import closeDarkIcon from '@/static/icon/close_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? closeDarkIcon : closeLightIcon"
      style="width: 32px; height: 32px"
    />
  </view>
</template>

<style lang="scss"></style>
