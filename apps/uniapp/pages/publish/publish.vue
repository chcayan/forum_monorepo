<script setup lang="ts">
import { useStatusStore, useUserStore } from '@/stores'
const statusStore = useStatusStore()
import { ref, toRaw } from 'vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'
import emitter from '@/utils/eventEmitter'
import {
  getPostDetailAPI,
  publishPostAPI,
  refreshAPI,
  updatePostInfoAPI,
} from '@/api'
import uniFilePicker from '@/uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue'
import { onShow, onUnload } from '@dcloudio/uni-app'
import { baseUrl, getImgUrl } from '@/utils'

const postId = ref('')
const fileList = ref<{ url: string }[]>([])
const userStore = useUserStore()

onUnload(() => {
  clearPostId()
})

const urlToFile = async (url: string) => {
  return new Promise<string>((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(res)
        }
      },
      fail: reject,
    })
  })
}

// 注：由于去相册选取图片会触发 onShow，导致再次选择的照片选上后又会被原先覆盖，所以用 flag 标记状态
let appFlag = true
onShow(async () => {
  const data = uni.getStorageSync('query')
  postId.value = data.postId

  if (postId.value && appFlag) {
    appFlag = false
    try {
      const res = await getPostDetailAPI(postId.value)
      const data: PostDetail = res.data.data
      if (data.userId !== userStore.userInfo.userId) {
        uni.showToast({
          icon: 'none',
          title: '不要修改别人的帖子哦',
        })
        return
      }

      context.value = data.pContent
      fileList.value = data.pImages.map((item) => ({ url: getImgUrl(item) }))
      emitter.emit('EVENT:ECHO_POST_IMAGES', data.pImages)
    } catch (err: any) {
      emitter.emit('API:NOT_FOUND', '未找到该帖子')
    }
  }
})

const clearPostId = () => {
  uni.removeStorageSync('query')
  postId.value = ''
  context.value = ''
  fileList.value = []
  isPublic.value = true
  appFlag = true
}

emitter.on('EVENT:RESET_PUBLISH_PAGE', () => {
  clearPostId()
})

const context = ref('')
const isPublic = ref(true)

const changeStatus = () => {
  isPublic.value = !isPublic.value
}

const files = ref(null)

function toRawArray(filesList: Array<File>) {
  let array: Array<File> = []
  filesList.forEach((item: any) => {
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

  let res

  try {
    if (postId.value) {
      const images: string[] = []
      for (const item of files.value.filesList) {
        if (item.file && item.file.path) {
          images.push(item.file.path)
        } else if (item.url) {
          const tempPath = await urlToFile(getImgUrl(item.url))
          images.push(tempPath)
        }
      }
      res = await updatePostInfoAPI({
        content: context.value as string,
        isPublic: isPublic.value ? 'true' : 'false',
        postImages: images,
        postId: postId.value,
      })
      emitter.emit('EVENT:UPDATE_POST_IMAGES', images.length, postId.value)
    } else {
      res = await publishPostAPI({
        content: context.value as string,
        isPublic: isPublic.value ? 'true' : 'false',
        postImages: toRawArray(files.value.filesList),
      })
    }
    context.value = ''
    files.value.clearFiles()

    uni.showToast({
      icon: 'none',
      title: postId.value ? '修改成功' : '发布成功',
    })

    clearPostId()
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', res, true)
  } catch {
  } finally {
    flag = true
  }
}

// #ifdef MP-WEIXIN
import { navigateInterceptor } from '@/utils'
import { PostDetail } from '@forum-monorepo/types'

onShow(() => {
  navigateInterceptor()
})
// #endif
</script>

<template>
  <view class="publish-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="header">
      <text class="title">{{ postId ? '编辑' : '新帖子' }}</text>
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
          v-model="fileList"
          class="img"
          ref="files"
          fileMediatype="image"
          mode="grid"
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
        :class="{ 'theme-publish': statusStore.isDarkMode }"
        class="publish"
        @click="publishPost"
      >
        {{ postId ? '修改' : '发布' }}
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
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 10px;
      font-weight: bold;
      font-size: 16px;
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
      line-height: 1.5;
      margin-bottom: 20px;
      border-radius: 10px;
      color: $theme-light-font-color;
      background-color: $theme-light-textarea-bg-color;
      font-family: inherit;
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
