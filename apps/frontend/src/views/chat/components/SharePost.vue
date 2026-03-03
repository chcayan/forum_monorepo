<script setup lang="ts">
import { getPostDetailAPI, updatePostViewAPI } from '@/api'
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
    <div class="title">
      <img :src="postInfo.userAvatar" alt="avatar" />
      <span>{{ postInfo.username }}</span>
    </div>
    <div class="content">{{ postInfo.pContent }}</div>
  </div>
  <div
    v-else
    class="share-post"
    style="height: 38px !important; cursor: default"
  >
    <p>该帖子暂时不可见</p>
  </div>
</template>

<style scoped lang="scss">
.share-post {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 100px;
  border-radius: 10px;
  padding: 10px;
  background-color: var(--theme-chat-speech-bubble-color);
  cursor: pointer;

  .title {
    display: flex;
    align-items: center;
    height: 32px;
    gap: 8px;

    img {
      width: 25px;
      height: 25px;
      aspect-ratio: 1;
      border-radius: 50%;
    }
  }

  .content {
    margin-top: 5px;
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
