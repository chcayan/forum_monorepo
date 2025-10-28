<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import type { ColorType, ToastParams } from './types'

const y = ref('-100px')
const toastRef = useTemplateRef('toast')

const _msg = ref<string>()
const btnType = ref<ColorType>('normal')

const confirmBtnVisible = ref(false)
const count = ref<number>()

function isInt(time: number) {
  if (Number.isNaN(time) || time === Infinity || typeof time !== 'number') {
    console.error('请输入一个正确的数字')
    return false
  }
  if (parseInt((time / 1000) as unknown as string) !== time / 1000) {
    console.error('请输入1000倍数的正整数')
    return false
  }
  return true
}

let timer: number | undefined

let _eventFn: () => void

const handleEvent = () => {
  _eventFn()
  Toast.hide()
}

class Toast {
  /**
   * 显示弹窗
   * @param params msg 弹窗信息 type 弹窗类型 duration 持续时间(ms),默认2s eventFn 弹窗事件
   */
  static show(options: ToastParams) {
    const { msg, type, duration = 2000, eventFn } = options
    if (duration) {
      if (!isInt(duration)) return
      setTimeout(() => {
        Toast.hide()
      }, duration)

      if (eventFn) {
        confirmBtnVisible.value = true
        count.value = duration / 1000

        if (timer) clearInterval(timer)
        timer = setInterval(() => {
          if (!count.value) return clearInterval(timer)
          if (count.value > 0) {
            count.value -= 1
          } else {
            confirmBtnVisible.value = false
            count.value = 0
            clearInterval(timer)
          }
        }, 1000)
        _eventFn = eventFn
      }
    }

    _msg.value = msg
    btnType.value = type
    toastRef.value?.animate(
      [
        {
          transform: `translateY(0) translateX(-50%)`,
        },
      ],
      {
        duration: 700,
        easing: 'ease',
        fill: 'forwards',
      }
    )
  }

  /**
   * 关闭弹窗
   */
  static hide() {
    confirmBtnVisible.value = false
    toastRef.value?.animate(
      [
        {
          transform: `translateY(${y.value}) translateX(-50%)`,
        },
      ],
      {
        duration: 700,
        easing: 'ease',
        fill: 'forwards',
      }
    )
  }
}

defineExpose({
  show: Toast.show,
  hide: Toast.hide,
})
</script>

<template>
  <div class="toast" :class="btnType" ref="toast">
    <span>{{ _msg }}</span>
    <button @click="handleEvent" v-if="confirmBtnVisible">
      &nbsp;&nbsp;确定（{{ count }}）
    </button>
  </div>
</template>

<style scoped lang="scss">
.toast {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: $toast-z-index;
  width: auto;
  min-width: 80px;
  margin-top: 20px;
  font-size: 14px;
  padding: 10px 15px;
  text-align: center;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 0 2px var(--theme-shadow-color);
  transform: translateY(v-bind(y)) translateX(-50%);

  button {
    margin-left: 10px;
    font-weight: bold;
    text-decoration: underline;
  }
}

.success {
  background-color: rgb(180, 232, 180);
}

.error {
  background-color: rgb(236, 164, 164);
}

.normal {
  background-color: rgb(255, 255, 255);
}
</style>
