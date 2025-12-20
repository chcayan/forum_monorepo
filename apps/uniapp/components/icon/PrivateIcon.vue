<script setup lang="ts">
import privateLightIcon from '@/static/icon/private_light.png'
import privateDarkIcon from '@/static/icon/private_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? privateDarkIcon : privateLightIcon"
      style="width: 25px; height: 25px"
    />
  </view>
</template>

<style lang="scss"></style>
