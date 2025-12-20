<script setup lang="ts">
import collectLightIcon from '@/static/icon/collect_light.png'
import collectDarkIcon from '@/static/icon/collect_dark.png'
import collectFocusLightIcon from '@/static/icon/collect_focus_light.png'
import collectFocusDarkIcon from '@/static/icon/collect_focus_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()

const props = defineProps<{
  isCollect: boolean
}>()
</script>

<template>
  <view>
    <image
      v-if="!isCollect"
      :src="statusStore.isDarkMode ? collectDarkIcon : collectLightIcon"
      style="width: 32px; height: 32px"
    />
    <image
      v-else
      :src="
        statusStore.isDarkMode ? collectFocusDarkIcon : collectFocusLightIcon
      "
      style="width: 32px; height: 32px"
    />
  </view>
</template>

<style lang="scss"></style>
