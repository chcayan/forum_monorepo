<script setup lang="ts">
const { status } = defineProps<{
  status: 0 | 2
}>()
</script>

<template>
  <div class="review">
    <p v-if="status === 0" class="in-review">审核中</p>
    <p v-if="status === 2" class="violation">审核不通过</p>
  </div>
</template>

<style scoped>
.review {
  cursor: default;

  p {
    margin-top: 3px;
    padding: 2px 5px;
    font-size: 12px;
  }

  .in-review {
    color: var(--theme-font-color);
    border: 1px solid var(--theme-font-color);
    border-radius: 5px;
  }

  .violation {
    color: red;
    border: 1px solid red;
    border-radius: 5px;
  }
}
</style>
