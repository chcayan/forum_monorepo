<script setup lang="ts">
import { getPostDetailAPI, updatePostViewAPI } from '@/api'
import WarnSvg from '@/components/svgIcon/WarnSvg.vue'
import router, { RouterPath } from '@/router'
import emitter from '@/utils/eventEmitter'
import type { PostDetail } from '@forum-monorepo/types'
import { ref } from 'vue'

const { postId } = defineProps<{
  postId: string | null
}>()

const postInfo = ref<PostDetail>({
  isPublic: '',
  pId: '',
  userId: '',
  pViewCount: '',
  pCollectCount: '',
  pShareCount: '',
  pCommentCount: '',
  pContent: '',
  pImages: [],
  status: 1,
  publishTime: '',
  userAvatar: '',
  username: '',
})

let isHide = ref(false)
const getPostInfo = async () => {
  if (postId) {
    const res = await getPostDetailAPI(postId)
    postInfo.value = res.data.data
  } else {
    isHide.value = true
  }
}
getPostInfo()

const navigateToPostDetail = async () => {
  if (postId) {
    router.push(`${RouterPath.post}/${postId}`)
    await updatePostViewAPI(postId)
      .then(() => {
        emitter.emit('EVENT:UPDATE_POST_LIST', postId)
        emitter.emit('EVENT:UPDATE_USER_POST_LIST', postId)
      })
      .catch(() => {
        router.replace(RouterPath.notFound)
        return
      })
  }
}
</script>

<template>
  <div v-if="!isHide" class="share-post" @click="navigateToPostDetail">
    <div class="content">{{ postInfo.pContent }}</div>
    <div class="title">
      <img :src="postInfo.userAvatar" alt="avatar" />
      <span>{{ postInfo.username }}</span>
    </div>
  </div>
  <div
    v-else
    class="share-post unwatch"
    style="height: 38px !important; width: fit-content; cursor: default"
  >
    <WarnSvg />
    <p>该帖子暂时不可见</p>
  </div>
</template>

<style scoped lang="scss">
.unwatch {
  opacity: 0.6;
  flex-direction: row !important;
  gap: 5px;
}

.share-post {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 200px;
  height: 83px;
  border-radius: 10px;
  padding: 8px 10px;
  background-color: var(--theme-chat-speech-bubble-color);
  cursor: pointer;

  .title {
    margin-top: 5px;
    align-self: flex-end;
    display: flex;
    align-items: center;
    height: 20px;
    gap: 5px;

    span {
      font-size: 12px;
    }

    img {
      width: 20px;
      height: 20px;
      aspect-ratio: 1;
      border-radius: 50%;
    }
  }

  .content {
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    text-overflow: ellipsis;
  }
}
</style>
