<script setup lang="ts">
import reportLightIcon from '@/static/icon/report_light.png'
import reportDarkIcon from '@/static/icon/report_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? reportDarkIcon : reportLightIcon"
      style="width: 32px; height: 32px"
    />
  </view>
</template>

<style lang="scss"></style>
