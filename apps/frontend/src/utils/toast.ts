import BaseToast from '@/components/toast/BaseToast.vue'
import { createApp } from 'vue'
import type { ToastParams } from '@/components/toast/types'

class Toast {
  static mount() {
    const toastInstance = createApp(BaseToast)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const toast = toastInstance.mount(container) as unknown as {
      show: (options: ToastParams) => void
    }
    return toast
  }
  static show = this.mount().show
}

export { Toast }
