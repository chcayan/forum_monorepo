<script setup lang="ts">
import searchLightIcon from '@/static/icon/search_light.png'
import searchDarkIcon from '@/static/icon/search_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? searchDarkIcon : searchLightIcon"
      style="width: 32px; height: 32px"
    >
    </image>
  </view>
</template>

<style lang="scss"></style>
