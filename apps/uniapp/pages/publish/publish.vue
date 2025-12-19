<script setup lang="ts">
import { useStatusStore } from '@/stores'
const statusStore = useStatusStore()
import { ref, toRaw } from 'vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'
import emitter from '@/utils/eventEmitter'
import { publishPostAPI } from '@/api'
import uniFilePicker from '@/uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue'

const context = ref('')
const isPublic = ref(true)

const changeStatus = () => {
  isPublic.value = !isPublic.value
}

const files = ref(null)

function toRawArray(filesList: Array) {
  let array = []
  filesList.forEach((item: Object) => {
    array.push(toRaw(item.file))
  })
  return array
}

let flag = true
const publishPost = async () => {
  if (!flag) return
  const trimmed = context.value.replace(/\s+$/, '')
  context.value = trimmed.trim().length ? trimmed : ''
  if (!context.value) {
    uni.showToast({
      icon: 'none',
      title: '请输入内容...',
    })
    return
  }
  flag = false

  try {
    const res = await publishPostAPI({
      content: context.value as string,
      isPublic: isPublic.value ? 'true' : 'false',
      postImages: toRawArray(files.value.filesList),
    })

    context.value = ''
    files.value.clearFiles()

    uni.showToast({
      icon: 'none',
      title: '发布成功',
    })

    emitter.emit('EVENT:RESET_POST_IMAGES')
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', res.data.p_id, true)
  } catch {
  } finally {
    flag = true
  }
}

const select = (e) => {
  console.log(e)
}

// #ifdef MP-WEIXIN
import { onShow } from '@dcloudio/uni-app'
import { navigateInterceptor } from '@/utils'

onShow(() => {
  navigateInterceptor()
})
// #endif
</script>

<template>
  <view class="publish-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="header">
      <text class="title">新帖子</text>
    </view>
    <view class="main">
      <text class="h3">内容：</text>
      <textarea
        class="content"
        :class="{ 'theme-content': statusStore.isDarkMode }"
        v-model="context"
        placeholder="请输入内容..."
      ></textarea>
      <view>
        <text class="h3">图片：</text>
        <uni-file-picker
          class="img"
          ref="files"
          fileMediatype="image"
          mode="grid"
          @select="select"
          :limit="9"
          :auto-upload="false"
        />
      </view>
      <view class="visible">
        <text class="h3">可见性：</text>
        <view class="btn">
          <ToggleBtn
            style="width: 120px"
            @click="changeStatus"
            :status="isPublic"
          >
            <template #first>公开</template>
            <template #second>隐藏</template>
          </ToggleBtn>
        </view>
      </view>
      <view
        @click="publishPost"
        @keydown.enter="publishPost"
        style="margin-top: 10px"
      >
        <button
          :class="{ 'theme-publish': statusStore.isDarkMode }"
          class="publish"
        >
          发布
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.theme-publish {
  box-shadow: $theme-dark-shadow-color !important;
  background-color: $theme-dark-button-color !important;
  color: black;
}

.theme-content {
  color: $theme-dark-font-color !important;
  background-color: $theme-dark-textarea-bg-color !important;
}

.publish-view {
  padding: 10px;
  padding-bottom: 60px;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom) - 80px);
  background-color: $theme-light-color;

  .header {
    .title {
      font-size: 24px;
      font-weight: bold;
    }
  }

  .main {
    margin-top: 20px;

    .publish {
      position: fixed;
      z-index: 100;
      bottom: calc(var(--window-bottom) + 10px);
      width: calc(100% - 20px);
      border-radius: 10px;
      font-weight: bold;
      box-shadow: $theme-light-shadow-color;
      background-color: $theme-light-button-color;
    }

    .h3 {
      margin-top: 20px;
      font-weight: bold;
    }

    .img {
      margin-top: 20px;
    }

    .content {
      margin: 10px 0 0;
      outline: none;
      border: none;
      width: calc(100% - 20px);
      height: 300px;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 10px;
      color: $theme-light-font-color;
      background-color: $theme-light-textarea-bg-color;
      font-family: system-ui;
    }

    .visible {
      display: flex;
      align-items: center;

      .h3 {
        height: 35px;
        margin-bottom: 5px;
        margin-right: auto;
      }
    }
  }
}
</style>
