<script setup lang="ts">
import commentLightIcon from '@/static/icon/comment_light.png'
import commentDarkIcon from '@/static/icon/comment_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? commentDarkIcon : commentLightIcon"
      style="width: 32px; height: 32px"
    />
  </view>
</template>

<style lang="scss"></style>
