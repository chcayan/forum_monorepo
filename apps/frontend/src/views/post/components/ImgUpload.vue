<script setup lang="ts">
import emitter from '@/utils/eventEmitter'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

const inputRef = useTemplateRef('inputEl')
const divRef = useTemplateRef('divEl')

const isHide = ref(false)

const allFiles: File[] = []
let off: () => void

onMounted(() => {
  const inputEl = inputRef.value
  const previewEl = divRef.value

  if (!inputEl || !previewEl) return

  off = emitter.on('EVENT:RESET_POST_IMAGES', () => {
    allFiles.length = 0
    previewEl.innerHTML = ''
  })

  inputEl.addEventListener('change', () => {
    const newFiles = Array.from(inputEl.files ?? [])

    if (newFiles.length > 9) {
      alert('最多只能上传 9 张图片！')
      return
    }
    const availableSlots = 9 - allFiles.length - newFiles.length
    if (availableSlots < 0) {
      alert('最多只能上传 9 张图片！')
      inputEl.value = ''
      return
    }

    allFiles.push(...newFiles)

    previewEl.innerHTML = ''

    let loadedCount = 0
    const frag = document.createDocumentFragment()

    allFiles.forEach((file: File) => {
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = document.createElement('img')
        img.src = e.target?.result as string
        img.classList.add('del-img')
        img.alt = 'post-img'
        img.title = '删除？'
        img.style.width = '100%'
        img.style.height = '100%'
        img.style.aspectRatio = '1'
        img.style.objectFit = 'cover'
        img.style.borderRadius = '10px'

        img.addEventListener('click', () => {
          const index = allFiles.indexOf(file)
          if (index !== -1) allFiles.splice(index, 1)
          img.remove()
          isHide.value = false
        })

        frag.appendChild(img)

        if (++loadedCount === allFiles.length) {
          previewEl.appendChild(frag)
        }
      }
      reader.readAsDataURL(file)
    })

    if (allFiles.length === 9) {
      isHide.value = true
    } else {
      isHide.value = false
    }

    inputEl.value = ''
  })
})

onUnmounted(() => {
  off?.()
})

defineExpose({
  allFiles,
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
