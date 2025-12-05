<script setup lang="ts">
import collectLightIcon from '@/static/icon/collect_light.png'
import collectDarkIcon from '@/static/icon/collect_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()

const props = defineProps<{
  isCollect: boolean
}>()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? collectDarkIcon : collectLightIcon"
      style="width: 32px; height: 32px"
    />
  </view>
</template>

<style lang="scss"></style>
