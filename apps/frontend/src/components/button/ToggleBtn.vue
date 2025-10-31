<script setup lang="ts">
const { status } = defineProps<{
  status: boolean
}>()
</script>

<template>
  <button
    :title="status ? '当前状态为：公开' : '当前状态为：隐藏'"
    :class="{ 'toggle-active': !status }"
    class="tab-focus-style toggle-btn"
  >
    <span>公开</span>
    <span>隐藏</span>
  </button>
</template>

<style scoped lang="scss">
.toggle-btn {
  width: 120px;
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

  span {
    padding: 0 16px;
  }
}

.toggle-active {
  background: linear-gradient(
    to left,
    var(--theme-send-button-color) 50%,
    var(--theme-color) 50%
  );
}
</style>
