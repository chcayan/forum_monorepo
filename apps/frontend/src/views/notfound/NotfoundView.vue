<script setup lang="ts">
import NotFoundSvg from '@/components/svgIcon/NotFoundSvg.vue'
import router, { RouterPath } from '@/router'
import { onUnmounted, ref } from 'vue'
const count = ref(5)
let timer: number | undefined

timer = setInterval(() => {
  if (count.value > 1) {
    count.value--
  } else {
    router.push(RouterPath.base)
  }
}, 1000)

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="notfound">
    <NotFoundSvg />
    <p>也许你正在寻找的，是连绝望都避之不及的未知深渊...</p>
    <p>
      {{ count }}秒后自动<button
        @click="router.push(RouterPath.base)"
        title="回到首页"
      >
        回到首页
      </button>
    </p>
  </div>
</template>

<style scoped lang="scss">
.notfound {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  align-items: center;
  gap: 20px;
  margin-top: 100px;

  p {
    font-size: 18px;
  }

  button {
    font-size: 18px;
    font-weight: bold;
    text-decoration: underline;
  }
}
</style>
