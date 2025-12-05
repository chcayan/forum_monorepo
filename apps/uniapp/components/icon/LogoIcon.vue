<script setup lang="ts">
import logoLightIcon from '@/static/icon/logo_light.png'
import logoDarkIcon from '@/static/icon/logo_dark.png'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
</script>

<template>
  <view>
    <image
      class="logo"
      :src="statusStore.isDarkMode ? logoDarkIcon : logoLightIcon"
      mode="aspectFill"
    />
  </view>
</template>

<style lang="scss">
.logo {
  width: 80px;
  height: 80px;
}
</style>
