<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useStatusStore } from '@/stores'
import { RouterPath } from '@/utils'
import { onBackPress } from '@dcloudio/uni-app'

const statusStore = useStatusStore()
const count = ref(5)
let timer: number | undefined

timer = setInterval(() => {
  if (count.value > 1) {
    count.value--
  } else {
    navigateToHome()
  }
}, 1000)

onBackPress(() => {
  clearInterval(timer)
})

function navigateToHome() {
  uni.switchTab({
    url: RouterPath.index,
  })
  clearInterval(timer)
}
</script>

<template>
  <view class="notfound" :class="{ theme: statusStore.isDarkMode }">
    <text class="tip">也许你正在寻找的，</text>
    <text class="tip">是连绝望都避之不及的未知深渊...</text>
    <text class="tip">
      {{ count }}秒后自动<text
        class="btn"
        :class="{ 'theme-btn': statusStore.isDarkMode }"
        @click="navigateToHome"
        title="回到首页"
      >
        回到首页
      </text>
    </text>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.theme-btn {
  color: $theme-dark-font-color !important;
}

.notfound {
  min-height: calc(100vh - var(--window-top) - 100px);
  max-height: calc(100vh - var(--window-top));
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  align-items: center;
  gap: 20px;
  padding-top: 100px;

  .tip {
    font-size: 18px;
  }

  .btn {
    color: $theme-light-font-color;
    font-size: 18px;
    font-weight: bold;
    text-decoration: underline;
  }
}
</style>
