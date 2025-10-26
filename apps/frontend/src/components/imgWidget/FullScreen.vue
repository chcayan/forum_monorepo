<script setup lang="ts">
import { ref } from 'vue'

const _imgEl = ref<HTMLImageElement | null>(null)

function wheelEvent(e: WheelEvent) {
  e.stopPropagation()
  e.preventDefault()
}

const exitFullscreen = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG') return
  _imgEl.value = null
  document.body.removeEventListener('wheel', wheelEvent)
}

const onFullScreen = (imgEl: HTMLImageElement) => {
  if (!imgEl) return
  _imgEl.value = imgEl
  document.body.addEventListener('wheel', wheelEvent, { passive: false })
}

defineExpose({
  onFullScreen,
})
</script>

<template>
  <div v-if="_imgEl" class="pic" title="退出全屏" @click="exitFullscreen">
    <img :src="_imgEl.src" alt="image" title="" />
  </div>
</template>

<style scoped lang="scss">
.pic {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $fullScreen-z-index;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(61, 61, 61, 0.7);

  img {
    max-width: 80%;
    max-height: 80%;
    cursor: default;
  }

  cursor: pointer;
}
</style>
