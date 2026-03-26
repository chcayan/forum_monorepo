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
import router, { RouterPath } from '@/router'
import { compressImage } from '@/utils/imgCompress'

const context = ref<string>('')

const imgUploadRef = useTemplateRef('ImgUploadEl')

const route = useRoute()
const postId = ref(route.query['edit-post'] || '')

const userStore = useUserStore()
onMounted(async () => {
  if (postId.value) {
    try {
      const res = await getPostDetailAPI(postId.value as string)
      const data: PostDetail = res.data.data
      if (data.userId !== userStore.userInfo.userId) {
        Toast.show({
          msg: '不要修改别人的帖子哦',
          type: 'error',
        })
        return
      }

      context.value = data.pContent
      tags.value = data.tags
      emitter.emit('EVENT:ECHO_POST_IMAGES', data.pImages)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err)
      emitter.emit('API:NOT_FOUND', err.response.data.message)
    }
  }
})

async function getPostImages() {
  const images: { type: 'file'; file: File }[] =
    imgUploadRef.value?.$!.exposed!.allImages

  let files: File[] = []

  for (let i = 0; i < images.length; i++) {
    const compressedFile = await compressImage(images[i]!.file!)
    if (compressedFile) {
      files.push(compressedFile)
    }
  }

  // images.forEach((item) => {
  // files.push(item.file)
  // })
  return files
}

const isPublic = ref(true)

const tag = ref('')
const tags = ref<string[]>([])

const addTag = () => {
  if (tag.value.length > 20) {
    Toast.show({
      msg: '标签长度不超过20字符',
      type: 'error',
    })
    return
  }

  if (tags.value.length >= 9) {
    Toast.show({
      msg: '标签最多9个',
      type: 'error',
    })
    return
  }

  if (tags.value.includes(tag.value)) {
    Toast.show({
      msg: '标签不要重复',
      type: 'error',
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
    if (postId.value) {
      let files = await getPostImages()
      res = await updatePostInfoAPI({
        content: context.value as string,
        isPublic: isPublic.value ? 'true' : 'false',
        postImages: files,
        postId: postId.value as string,
        tags: tags.value,
      })
      emitter.emit('EVENT:UPDATE_POST_IMAGES', files.length, postId.value)
    } else {
      res = await publishPostAPI({
        content: context.value as string,
        isPublic: isPublic.value ? 'true' : 'false',
        postImages: await getPostImages(),
        tags: tags.value,
      })
    }
    context.value = ''
    tags.value = []
    Toast.show({
      msg: postId.value ? '修改成功' : '发布成功',
      type: 'success',
    })

    if (postId.value) {
      router.push(RouterPath.publish)
      postId.value = ''
    }
    emitter.emit('EVENT:RESET_POST_IMAGES')
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', res, true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    emitter.emit(
      'API:FORBIDDEN',
      err?.response?.data?.message || '服务器异常，请重试'
    )
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
        <div class="tags">
          <h3>标签：</h3>
          <div class="tag-input">
            <input type="text" v-model="tag" />
            <button class="add" @click="addTag" title="添加">添加</button>
          </div>
        </div>
        <ul class="tag-list">
          <li v-for="tag in tags" :key="tag">
            <span
              ><span style="font-weight: bold">#</span>&nbsp;&nbsp;{{
                tag
              }}</span
            >
            <button @click="delTag(tag)" title="删除">x</button>
          </li>
        </ul>
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

      .tag-list {
        margin-top: 10px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;

        li {
          display: flex;
          align-items: center;
          height: 35px;
          padding: 5px 0 5px 10px;
          background-color: var(--theme-textarea-bg-color);
          border-radius: 10px;

          span {
            font-size: 14px;
            // font-weight: bold;
          }
        }

        button {
          width: 35px;
          height: 35px;
          font-size: 20px;
          margin-left: 15px;
          background-color: var(--theme-button-color);
          border-radius: 0 10px 10px 0;
          color: black;
        }
      }

      .tags {
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        h3 {
          margin-top: 0;
        }

        .tag-input {
          display: flex;

          input {
            width: 100%;
            height: 35px;
            padding: 10px;
            border-radius: 10px 0 0 10px;
            color: var(--theme-font-color);
            background-color: var(--theme-textarea-bg-color);
          }

          .add {
            flex-shrink: 0;
            padding: 10px;
            width: 60px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            // border-radius: 50%;
            background-color: var(--theme-button-color);
            border-radius: 0 10px 10px 0;
          }
        }
      }

      .publish {
        margin-top: 10px;
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
        font-family: inherit;

        &::placeholder {
          color: var(--theme-font-color);
          opacity: 0.6;
        }
        &::-webkit-scrollbar {
          width: 10px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-color: var(--theme-scrollbar-thumb-color);
        }
      }

      .visible {
        margin-top: 20px;
        display: flex;
        align-items: center;

        h3 {
          margin-top: 0;
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
