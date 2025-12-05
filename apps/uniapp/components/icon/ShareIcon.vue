<script setup lang="ts">
import shareLightIcon from '@/static/icon/share_light.png'
import shareDarkIcon from '@/static/icon/share_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? shareDarkIcon : shareLightIcon"
      style="width: 28px; height: 28px"
    />
  </view>
</template>

<style lang="scss"></style>
