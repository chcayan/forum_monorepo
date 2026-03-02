<script setup lang="ts">
import { Toast } from '@/utils'
import emitter from '@/utils/eventEmitter'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

const inputRef = useTemplateRef('inputEl')
const divRef = useTemplateRef('divEl')

const isHide = ref(false)

type ImageItem = { type: 'file'; file: File } | { type: 'url'; url: string }

const allImages: ImageItem[] = []

let off: () => void
let off1: () => void

onMounted(() => {
  const inputEl = inputRef.value
  const previewEl = divRef.value

  if (!inputEl || !previewEl) return

  off = emitter.on('EVENT:RESET_POST_IMAGES', () => {
    allImages.length = 0
    previewEl.innerHTML = ''
  })

  inputEl.addEventListener('change', () => {
    const newFiles = Array.from(inputEl.files ?? [])

    if (allImages.length + newFiles.length > 9) {
      Toast.show({
        msg: '最多只能上传 9 张图片！',
        type: 'error',
      })
      inputEl.value = ''
      return
    }

    allImages.push(
      ...newFiles.map((file) => ({
        type: 'file' as const,
        file,
      }))
    )

    renderPreview()

    inputEl.value = ''
  })

  async function setImages(urls: string[]) {
    allImages.length = 0

    for (let i = 0; i < urls.length; i++) {
      const res = await fetch(urls[i]!)
      const blob = await res.blob()
      const name = urls[i]!.split('/').pop() || 'image.jpg'
      allImages.push({
        type: 'file',
        file: new File([blob], name, {
          type: blob.type,
        }),
      })
    }

    // allImages.push(
    //   ...urls.map((url): ImageItem => {
    //     const res = await fetch(url)
    //     const blob = await res.blob()
    //     const name = item.url.split('/').pop() || 'image.jpg'

    //     return {
    //       type: 'file',
    //       file: new File([blob], name, {
    //         type: blob.type,
    //       }),
    //     }
    //   })
    // )

    renderPreview()
  }

  off1 = emitter.on('EVENT:ECHO_POST_IMAGES', (images: string[]) => {
    setImages(images)
  })

  function renderPreview() {
    if (!previewEl) return
    previewEl.innerHTML = ''

    const frag = document.createDocumentFragment()

    allImages.forEach((item, index) => {
      // if (!item.type.startsWith('image/')) return

      const img = document.createElement('img')

      if (item.type === 'file') {
        img.src = URL.createObjectURL(item.file)
      } else {
        img.src = item.url
      }

      // img.src = URL.createObjectURL(file)

      img.classList.add('del-img')
      img.alt = 'post-img'
      img.title = '删除？'

      img.style.width = '100%'
      img.style.height = '100%'
      img.style.aspectRatio = '1'
      img.style.objectFit = 'cover'
      img.style.borderRadius = '10px'

      img.onclick = () => {
        allImages.splice(index, 1)
        renderPreview()
        isHide.value = false
      }

      frag.appendChild(img)
    })

    previewEl.appendChild(frag)

    isHide.value = allImages.length === 9
  }
})

onUnmounted(() => {
  off?.()
  off1?.()
})

defineExpose({
  allImages,
})
</script>

<template>
  <div class="img-upload">
    <div ref="divEl" id="preview"></div>
    <label
      tabindex="0"
      class="tab-focus-outline-style image"
      :class="{ hide: isHide }"
      title="添加图片"
      @keydown.enter="inputRef?.click()"
    >
      <input
        ref="inputEl"
        type="file"
        id="imageInput"
        multiple
        accept="image/*"
        style="display: none"
      />
      <p>+</p>
    </label>
  </div>
</template>

<style scoped lang="scss">
.img-upload {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-items: center;
  margin-top: 10px;

  .image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 10px;
    cursor: pointer;
    // box-shadow: 0 0 1px var(--theme-font-color);
    box-shadow: var(--theme-shadow-color);

    p {
      font-size: 50px;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    &:hover {
      p {
        transform: scale(1.05);
        opacity: 1;
      }
    }
  }

  #preview {
    display: contents;
  }
}

.hide {
  display: none !important;
}
</style>
