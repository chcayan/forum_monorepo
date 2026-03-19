<script setup lang="ts">
import msgLightIcon from '@/static/icon/msg_light.png'
import msgDarkIcon from '@/static/icon/msg_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view style="width: 32px; height: 34px">
    <image
      :src="statusStore.isDarkMode ? msgDarkIcon : msgLightIcon"
      style="width: 32px; height: 32px"
    />
  </view>
</template>

<style lang="scss"></style>
