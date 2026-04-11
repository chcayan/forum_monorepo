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

const tag = ref('')
const tags = ref<string[]>([])

const addTag = () => {
  if (tag.value.length > 20) {
    uni.showToast({
      icon: 'none',
      title: '标签长度不超过20字符',
    })
    return
  }

  if (tags.value.length >= 9) {
    uni.showToast({
      icon: 'none',
      title: '标签最多9个',
    })
    return
  }

  if (tags.value.includes(tag.value)) {
    uni.showToast({
      icon: 'none',
      title: '标签不要重复',
    })
    return
  }

  tags.value.push(tag.value.trim())
  tag.value = ''
}

const delTag = (name: string) => {
  const index = tags.value.indexOf(name)

  if (index !== -1) {
    tags.value.splice(index, 1)
  }
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
        tags: tags.value,
      })
      emitter.emit('EVENT:UPDATE_POST_IMAGES', images.length, postId.value)
    } else {
      res = await publishPostAPI({
        content: context.value as string,
        isPublic: isPublic.value ? 'true' : 'false',
        postImages: toRawArray(files.value.filesList),
        tags: tags.value,
      })
    }
    context.value = ''
    tags.value = []
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
      <view class="tags">
        <text class="h3">标签：</text>
        <view class="tag-input">
          <input
            class="input"
            :class="{ 'theme-input': statusStore.isDarkMode }"
            type="text"
            v-model="tag"
          />
          <text
            class="add"
            :class="{ 'theme-add': statusStore.isDarkMode }"
            @click="addTag"
            title="添加"
            >添加</text
          >
        </view>
      </view>
      <view class="tag-list">
        <view
          class="li"
          :class="{ 'theme-li': statusStore.isDarkMode }"
          v-for="tag in tags"
          :key="tag"
        >
          <text class="span"
            ><text class="span" style="font-weight: bold">#</text>&nbsp;&nbsp;{{
              tag
            }}</text
          >
          <text
            class="button"
            :class="{ 'theme-button': statusStore.isDarkMode }"
            @click="delTag(tag)"
            title="删除"
            >x</text
          >
        </view>
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

.theme-li {
  background-color: $theme-dark-textarea-bg-color !important;
}

.theme-button {
  background-color: $theme-dark-button-color !important;
}

.theme-input {
  color: $theme-dark-font-color !important;
  background-color: $theme-dark-textarea-bg-color !important;
}

.theme-add {
  background-color: $theme-dark-button-color !important;
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

    .tag-list {
      margin-top: 10px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;

      .li {
        display: flex;
        align-items: center;
        height: 35px;
        padding: 5px 0 5px 10px;
        background-color: $theme-light-textarea-bg-color;
        border-radius: 10px;
        box-sizing: border-box;

        .span {
          font-size: 14px;
        }
      }

      .button {
        width: 35px;
        height: 35px;
        display: flex;
        line-height: 31px;
        justify-content: center;
        font-size: 20px;
        margin-left: 15px;
        background-color: $theme-light-button-color;
        border-radius: 0 10px 10px 0;
        color: black;
      }
    }

    .tags {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .h3 {
        margin-top: 0;
        flex-shrink: 0;
      }

      .tag-input {
        display: flex;

        .input {
          width: 100%;
          height: 35px;
          padding: 10px;
          box-sizing: border-box;
          border-radius: 10px 0 0 10px;
          color: $theme-light-font-color;
          background-color: $theme-light-textarea-bg-color;
        }

        .add {
          box-sizing: border-box;
          flex-shrink: 0;
          padding: 10px;
          width: 60px;
          font-size: 14px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          background-color: $theme-light-button-color;
          color: black;
          border-radius: 0 10px 10px 0;
        }
      }
    }

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
      height: 35px;
      margin-top: 20px;
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
