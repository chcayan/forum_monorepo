import BaseToast from '@/components/toast/BaseToast.vue'
import { createApp } from 'vue'
import type { ToastParams } from '@/components/toast/types'

class Toast {
  private static toast = Toast.mount()
  private static timer: number | null = null

  private static mount() {
    const toastInstance = createApp(BaseToast)
    const container = document.createElement('div')
    document.body.appendChild(container)

    const toast = toastInstance.mount(container) as unknown as {
      show: (options: ToastParams) => void
    }
    return toast
  }
  static show({ msg, type, duration = 2000, eventFn }: ToastParams) {
    if (this.timer) return

    this.toast.show({
      msg,
      type,
      duration,
      ...(eventFn ? { eventFn } : {}),
    })

    this.timer = window.setTimeout(() => {
      this.timer = null
    }, duration)
  }
}

export { Toast }
