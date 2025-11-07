/* eslint-disable @typescript-eslint/no-explicit-any */
import FullScreen from '@/components/imgWidget/FullScreen.vue'
import { createApp } from 'vue'
import type { DirectiveBinding } from 'vue'
import { Toast } from './toast'

class ImgFullScreenWidget {
  static mount() {
    const imgInstance = createApp(FullScreen)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const img = imgInstance.mount(container) as unknown as {
      onFullScreen: (imgEl: HTMLImageElement) => void
    }

    return img
  }

  static img = ImgFullScreenWidget.mount()
}

interface EditableLimitOptions {
  max?: number
  onInput?: (text: string) => void
}

export const directives: Record<string, any> = {
  loading: {
    mounted(el: HTMLElement) {
      const lightStyle = `
        rgba(0, 0, 0, 0.5) 30%,
        rgba(0, 0, 0, 0.9) 50%,
        rgba(0, 0, 0, 0.5) 70%
      `
      const darkStyle = `
        rgba(255, 255, 255, 0.5) 30%,
        rgba(255, 255, 255, 0.9) 50%,
        rgba(255, 255, 255, 0.5) 70%
      `
      const dataset = document.body.dataset

      el.style.background = 'var(--theme-img-loading-color)'
      if (dataset.theme === 'Light') {
        el.style.mask = `linear-gradient(-45deg,${lightStyle})`
      } else {
        el.style.mask = `linear-gradient(-45deg,${darkStyle})`
      }

      el.style.maskSize = '300% 300%'
      el.style.webkitMaskSize = '300% 300%'

      const animation = el.animate(
        [
          {
            maskPosition: '0% 0%',
            webkitMaskPosition: '0% 0%',
          },
          {
            maskPosition: '100% 100%',
            webkitMaskPosition: '100% 100%',
          },
        ],
        {
          duration: 2000,
          easing: 'linear',
          iterations: Infinity,
        }
      )

      el.addEventListener('load', () => {
        el.style.mask = ''
        el.style.webkitMask = ''
        el.style.maskSize = ''
        el.style.webkitMaskSize = ''
        animation.cancel()
      })
    },
  },

  disableEnter: {
    mounted(el: HTMLElement) {
      el.addEventListener('keydown', (event) => {
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          event.preventDefault()
        }
      })
    },
  },

  fullScreen: {
    mounted(el: HTMLImageElement) {
      el.addEventListener('click', () => {
        ImgFullScreenWidget.img.onFullScreen(el)
      })
    },
  },

  editableLimit: {
    mounted(el: HTMLElement, binding: DirectiveBinding<EditableLimitOptions>) {
      const { max = 16, onInput } = binding.value || {}
      let isComposing = false

      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') e.preventDefault()
      })

      el.addEventListener('compositionstart', () => {
        isComposing = true
      })

      el.addEventListener('compositionend', () => {
        isComposing = false
        handleInput()
      })

      el.addEventListener('input', () => {
        if (!isComposing) {
          handleInput()
        }
      })

      function handleInput() {
        const text = el.innerText

        if (text.length > max) {
          Toast.show({
            msg: `最多${max}字符`,
            type: 'error',
          })
          el.innerText = text.slice(0, max)

          const range = document.createRange()
          const sel = window.getSelection()
          if (sel) {
            range.selectNodeContents(el)
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }

        if (onInput && typeof onInput === 'function') {
          onInput(el.innerText)
        }
      }
    },
  },
}
