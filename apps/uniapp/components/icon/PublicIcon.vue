<script setup lang="ts">
import publicLightIcon from '@/static/icon/public_light.png'
import publicDarkIcon from '@/static/icon/public_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? publicDarkIcon : publicLightIcon"
      style="width: 25px; height: 25px"
    />
  </view>
</template>

<style lang="scss"></style>
