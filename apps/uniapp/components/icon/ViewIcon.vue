<script setup lang="ts">
import viewLightIcon from '@/static/icon/view_light.png'
import viewDarkIcon from '@/static/icon/view_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? viewDarkIcon : viewLightIcon"
      style="width: 30px; height: 30px"
    />
  </view>
</template>

<style lang="scss"></style>
