<script setup lang="ts">
import delLightIcon from '@/static/icon/del_light.png'
import delDarkIcon from '@/static/icon/del_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? delDarkIcon : delLightIcon"
      style="width: 25px; height: 25px"
    />
  </view>
</template>

<style lang="scss"></style>
