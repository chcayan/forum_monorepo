<script setup lang="ts">
const { status } = defineProps<{
  status: boolean
}>()
</script>

<template>
  <button
    :class="{ 'toggle-active': !status }"
    class="tab-focus-style toggle-btn"
  >
    <span><slot name="first">按钮1</slot></span>
    <span><slot name="second">按钮2</slot></span>
  </button>
</template>

<style scoped lang="scss">
.toggle-btn {
  // width: 120px;
  width: 100%;
  height: 35px;
  background: linear-gradient(
    to right,
    var(--theme-send-button-color) 50%,
    var(--theme-color) 50%
  );

  color: var(--theme-font-color);
  box-shadow: 0 0 2px var(--theme-shadow-color);
  border-radius: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.toggle-active {
  background: linear-gradient(
    to left,
    var(--theme-send-button-color) 50%,
    var(--theme-color) 50%
  );
}
</style>
