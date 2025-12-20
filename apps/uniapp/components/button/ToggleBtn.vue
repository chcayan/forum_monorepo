<script setup lang="ts">
import { useStatusStore } from '@/stores'
const statusStore = useStatusStore()
const props = defineProps<{
  status: boolean
}>()
</script>

<template>
  <view
    :class="{
      'toggle-active': !props.status,
      'theme-toggle-btn': statusStore.isDarkMode,
      'theme-toggle-active': statusStore.isDarkMode && !props.status,
    }"
    class="toggle-btn"
  >
    <text>
      <slot name="first">按钮1</slot>
    </text>
    <text>
      <slot name="second">按钮2</slot>
    </text>
  </view>
</template>

<style scoped lang="scss">
.theme-toggle-btn {
  background: linear-gradient(
    to right,
    $theme-dark-send-button-color 50%,
    $theme-dark-color 50%
  ) !important;
  color: $theme-dark-font-color !important;
  box-shadow: $theme-dark-shadow-color !important;
}

.theme-toggle-active {
  background: linear-gradient(
    to left,
    $theme-dark-send-button-color 50%,
    $theme-dark-color 50%
  ) !important;
}

.toggle-btn {
  width: 100%;
  height: 35px;
  font-size: 14px;
  padding: 0;
  background: linear-gradient(
    to right,
    $theme-light-send-button-color 50%,
    $theme-light-color 50%
  );

  color: $theme-light-font-color;
  box-shadow: $theme-light-shadow-color;
  border-radius: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.toggle-active {
  background: linear-gradient(
    to left,
    $theme-light-send-button-color 50%,
    $theme-light-color 50%
  );
}
</style>
