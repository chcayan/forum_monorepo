<script setup lang="ts">
import { ref } from 'vue'

const _imgEl = ref<HTMLImageElement | null>(null)

function wheelEvent(e: WheelEvent) {
  e.stopPropagation()
  e.preventDefault()
}

function touchEvent(e: TouchEvent) {
  e.stopPropagation()
  e.preventDefault()
}

const exitFullscreen = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG') return
  _imgEl.value = null
  document.body.removeEventListener('wheel', wheelEvent)
  document.body.removeEventListener('touchmove', touchEvent)
  history.back()
}

const onFullScreen = (imgEl: HTMLImageElement) => {
  if (!imgEl) return
  _imgEl.value = imgEl
  history.pushState(
    {
      current: location.pathname,
    },
    ''
  )
  document.body.addEventListener('wheel', wheelEvent, { passive: false })
  document.body.addEventListener('touchmove', touchEvent, { passive: false })
}

window.addEventListener('popstate', () => {
  if (_imgEl.value) {
    _imgEl.value = null
    document.body.removeEventListener('wheel', wheelEvent)
    document.body.removeEventListener('touchmove', touchEvent)
  }
})

defineExpose({
  onFullScreen,
})
</script>

<template>
  <div v-if="_imgEl" class="shade" title="退出全屏" @click="exitFullscreen">
    <img :src="_imgEl.src" alt="image" title="" />
  </div>
</template>

<style scoped lang="scss">
.shade {
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
