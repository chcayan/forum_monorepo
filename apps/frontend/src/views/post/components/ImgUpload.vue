<script setup lang="ts">
import { Toast } from '@/utils'
import emitter from '@/utils/eventEmitter'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

const inputRef = useTemplateRef('inputRef')
const divRef = useTemplateRef('divRef')

const isHide = ref(false)

type ImageItem = { type: 'file'; file: File } | { type: 'url'; url: string }

const allImages: ImageItem[] = []

let inputEl: HTMLInputElement | null
let previewEl: HTMLDivElement | null

let off: () => void
let off1: () => void

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

  renderPreview()
}

let dragIndex: number | null
let hoverIndex: number | null

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

    // 拖拽
    img.dataset.index = index.toString()
    img.draggable = true

    img.ondragstart = (e) => {
      const target = e.target as HTMLElement

      if (target) {
        dragIndex = Number(target.dataset.index)
      }
    }

    img.ondragenter = (e) => {
      const target = e.target as HTMLElement

      if (target) {
        const newIndex = Number(target.dataset.index)
        if (hoverIndex !== newIndex) {
          hoverIndex = newIndex
          updateHighlight()
        }
      }
    }

    img.ondragover = (e) => {
      e.preventDefault()
    }

    img.ondragend = () => {
      dragIndex = null
      hoverIndex = null
      updateHighlight()
    }

    img.ondrop = (e) => {
      const target = e.target as HTMLElement
      if (!target) return
      const index = Number(target.dataset.index)

      if (dragIndex === null || dragIndex === index) return
      ;[allImages[dragIndex], allImages[index]] = [
        allImages[index]!,
        allImages[dragIndex]!,
      ]

      dragIndex = null
      hoverIndex = null

      renderPreview()
    }

    function updateHighlight() {
      if (!previewEl) return
      const imgs = previewEl.querySelectorAll('img')

      imgs.forEach((img, i) => {
        if (i === dragIndex || i === hoverIndex) {
          img.style.transition = 'none'
          img.style.outline = '5px solid rgba(177, 177, 177, 1)'
        } else {
          img.style.transition = 'none'
          img.style.outline = 'none'
        }
      })
    }

    frag.appendChild(img)
  })

  previewEl.appendChild(frag)

  isHide.value = allImages.length === 9
}

onMounted(() => {
  inputEl = inputRef.value
  previewEl = divRef.value

  if (!inputEl || !previewEl) return

  off = emitter.on('EVENT:RESET_POST_IMAGES', () => {
    allImages.length = 0
    if (previewEl) {
      previewEl.innerHTML = ''
    }
  })

  inputEl.addEventListener('change', () => {
    if (!inputEl) return
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

  off1 = emitter.on('EVENT:ECHO_POST_IMAGES', (images: string[]) => {
    setImages(images)
  })
})

const handleDrop = (e: DragEvent) => {
  e.preventDefault()

  const files = Array.from(e.dataTransfer!.files).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue

    allImages.push({
      type: 'file' as const,
      file,
    })

    renderPreview()
  }
}

let dragging = ref(false)

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
    <div ref="divRef" id="preview"></div>
    <label
      tabindex="0"
      class="tab-focus-outline-style image"
      :class="{ hide: isHide }"
      title="添加图片"
      @keydown.enter="inputRef?.click()"
      @dragover.prevent
      @drop="handleDrop"
      @dragenter="dragging = true"
      @dragleave="dragging = false"
    >
      <input
        ref="inputRef"
        type="file"
        id="imageInput"
        multiple
        accept="image/*"
        style="display: none"
      />
      <p :class="{ dragging }">+</p>
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
      pointer-events: none;
    }

    .dragging {
      transform: scale(1.05);
      opacity: 1;
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
