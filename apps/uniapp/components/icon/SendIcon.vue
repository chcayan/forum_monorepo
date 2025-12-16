<script setup lang="ts">
import sendLightIcon from '@/static/icon/send_light.png'
import sendDarkIcon from '@/static/icon/send_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view style="width: 32px; height: 32px">
    <image
      :src="statusStore.isDarkMode ? sendDarkIcon : sendLightIcon"
      style="width: 32px; height: 32px"
    />
  </view>
</template>

<style lang="scss"></style>
