<script setup lang="ts">
import modifyLightIcon from '@/static/icon/modify_light.png'
import modifyDarkIcon from '@/static/icon/modify_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? modifyDarkIcon : modifyLightIcon"
      style="width: 19px; height: 19px; margin-top: 3px"
    />
  </view>
</template>

<style lang="scss"></style>
