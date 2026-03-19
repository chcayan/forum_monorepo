<script setup lang="ts">
import warnLightIcon from '@/static/icon/warn_light.png'
import warnDarkIcon from '@/static/icon/warn_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? warnDarkIcon : warnLightIcon"
      style="width: 20px; height: 20px"
    />
  </view>
</template>

<style lang="scss"></style>
