import BaseToast from '@/components/toast/BaseToast.vue'
import _ChatToast from '@/components/toast/ChatToast.vue'
import { createApp } from 'vue'
import type { ChatToastParams, ToastParams } from '@/components/toast/types'
import { directives } from './directives'

class Toast {
  private static toast = Toast.mount()

  private static mount() {
    const toastInstance = createApp(BaseToast)
    const container = document.createElement('div')
    document.body.appendChild(container)

    const toast = toastInstance.mount(container) as unknown as {
      show: (options: ToastParams) => void
    }
    return toast
  }

  static show({
    msg,
    type,
    duration = 2000,
    eventFn,
    confirmText = '确认',
  }: ToastParams) {
    this.toast.show({
      msg,
      type,
      duration,
      ...(eventFn ? { eventFn } : {}),
      confirmText,
    })
  }
}

class ChatToast {
  private static toast = ChatToast.mount()

  private static mount() {
    const toastInstance = createApp(_ChatToast)
    toastInstance.directive('loading', directives['loading'])
    toastInstance.directive('disableEnter', directives['disableEnter'])
    const container = document.createElement('div')
    document.body.appendChild(container)

    const toast = toastInstance.mount(container) as unknown as {
      show: (options: ChatToastParams) => void
    }
    return toast
  }

  static show({
    userAvatar,
    userId,
    username,
    message,
    isShare = '0',
  }: ChatToastParams) {
    this.toast.show({
      userId,
      username,
      userAvatar,
      message,
      isShare,
    })
  }
}

export { Toast, ChatToast }
