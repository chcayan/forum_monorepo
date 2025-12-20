<script setup lang="ts">
import editLightIcon from '@/static/icon/edit_light.png'
import editDarkIcon from '@/static/icon/edit_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      :src="statusStore.isDarkMode ? editDarkIcon : editLightIcon"
      style="width: 30px; height: 30px"
    />
  </view>
</template>

<style lang="scss"></style>
