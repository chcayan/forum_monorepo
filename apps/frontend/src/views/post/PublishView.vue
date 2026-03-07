<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import ImgUpload from './components/ImgUpload.vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'
import emitter from '@/utils/eventEmitter'
import { getPostDetailAPI, publishPostAPI, updatePostInfoAPI } from '@/api'
import { Toast } from '@/utils'
import { useRoute } from 'vue-router'
import { PostDetail } from '@forum-monorepo/types'
import { useUserStore } from '@/stores'

const context = ref<string>('')

const imgUploadRef = useTemplateRef('ImgUploadEl')

const route = useRoute()
const postId = route.query['edit-post']

const userStore = useUserStore()
onMounted(async () => {
  if (postId) {
    try {
      const res = await getPostDetailAPI(postId as string)
      const data: PostDetail = res.data.data
      if (data.userId !== userStore.userInfo.userId) {
        Toast.show({
          msg: '不要修改别人的帖子哦',
          type: 'error',
        })
        return
      }

      context.value = data.pContent
      emitter.emit('EVENT:ECHO_POST_IMAGES', data.pImages)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err)
      emitter.emit('API:NOT_FOUND', err.response.data.message)
    }
  }
})

function getPostImages() {
  const images: { type: 'file'; file: File }[] =
    imgUploadRef.value?.$!.exposed!.allImages

  let files: File[] = []

  images.forEach((item) => {
    files.push(item.file)
  })

  return files
}

const isPublic = ref(true)

const changeStatus = () => {
  isPublic.value = !isPublic.value
}

let flag = true
const publishPost = async () => {
  if (!flag) return
  const trimmed = context.value.replace(/\s+$/, '')
  context.value = trimmed.trim().length ? trimmed : ''
  if (!context.value) {
    Toast.show({
      msg: '请输入内容...',
      type: 'error',
    })
    return
  }
  flag = false

  let res

  try {
    if (postId) {
      res = await updatePostInfoAPI({
        content: context.value as string,
        isPublic: isPublic.value ? 'true' : 'false',
        postImages: getPostImages(),
        postId: postId as string,
      })
    } else {
      res = await publishPostAPI({
        content: context.value as string,
        isPublic: isPublic.value ? 'true' : 'false',
        postImages: getPostImages(),
      })
    }
    context.value = ''
    Toast.show({
      msg: postId ? '修改成功' : '发布成功',
      type: 'success',
    })

    emitter.emit('EVENT:RESET_POST_IMAGES')
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', res, true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    emitter.emit('API:FORBIDDEN', err?.response?.data?.message || '未知错误')
  } finally {
    flag = true
  }
}

let off = emitter.on('EVENT:PUBLISH_POST', publishPost)

onUnmounted(() => {
  off?.()
})
</script>

<template>
  <form class="publish-view" @submit.prevent>
    <article>
      <header>
        <h2>{{ postId ? '编辑' : '新帖子' }}</h2>
      </header>
      <div class="main">
        <h3>内容：</h3>
        <textarea
          v-model="context"
          name="context"
          placeholder="请输入内容..."
        ></textarea>
        <h3>图片：</h3>
        <ImgUpload ref="ImgUploadEl" />
        <div class="visible">
          <h3>可见性：</h3>
          <ToggleBtn
            style="width: 120px"
            @click="changeStatus"
            :status="isPublic"
          >
            <template #first>公开</template>
            <template #second>隐藏</template>
          </ToggleBtn>
        </div>
        <div
          @click="publishPost"
          @keydown.enter="publishPost"
          style="margin-top: 10px"
        >
          <button class="publish">{{ postId ? '修改' : '发布' }}</button>
        </div>
      </div>
    </article>
  </form>
</template>

<style scoped lang="scss">
.publish-view {
  article {
    width: 400px;
    padding: 10px;
    box-shadow: 0 0 10px rgba(156, 164, 172, 0.3);
    border-radius: 10px;

    header {
      p {
        opacity: 0.7;
      }
    }

    .main {
      margin-top: 20px;

      .publish {
        width: 100%;
        height: 40px;
        border-radius: 10px;
        font-weight: bold;
        box-shadow: var(--theme-shadow-color);
        background-color: var(--theme-button-color);
      }

      h3 {
        margin-top: 20px;
      }

      textarea {
        margin: 10px 0 0;
        outline: none;
        border: none;
        width: 100%;
        height: 300px;
        resize: none;
        padding: 10px;
        border-radius: 10px;
        color: var(--theme-font-color);
        background-color: var(--theme-textarea-bg-color);
        font-family: system-ui;

        &::-webkit-scrollbar {
          width: 10px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-color: var(--theme-scrollbar-thumb-color);
        }
      }

      .visible {
        display: flex;
        align-items: center;

        h3 {
          margin-bottom: 10px;
          margin-right: auto;
        }
      }
    }

    footer {
      position: fixed;
      bottom: 0;
    }

    @media (max-width: $mobile-size) {
      margin-top: 10px;
      width: calc(100vw - 20px);
    }
  }
}
</style>
