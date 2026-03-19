<script setup lang="ts">
const { status } = defineProps<{
  status: 0 | 2
}>()
</script>

<template>
  <view class="review">
    <text v-if="status === 0" class="in-review p">审核中</text>
    <text v-if="status === 2" class="violation p">审核不通过</text>
  </view>
</template>

<style scoped lang="scss">
.review {
  cursor: default;

  .p {
    margin-top: 3px;
    padding: 2px 5px;
    font-size: 12px;
  }

  .in-review {
    // color: var(--theme-font-color);
    border: 1px solid;
    border-radius: 5px;
  }

  .violation {
    color: red;
    border: 1px solid red;
    border-radius: 5px;
  }
}
</style>
