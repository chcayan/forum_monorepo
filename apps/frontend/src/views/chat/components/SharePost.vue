<script setup lang="ts">
import { getPostDetailAPI, updatePostViewAPI } from '@/api'
import router, { RouterPath } from '@/router'
import emitter from '@/utils/eventEmitter'
import type { PostDetail } from '@forum-monorepo/types'
import { ref } from 'vue'

const { postId } = defineProps<{
  postId: string
}>()

const postInfo = ref<PostDetail>({
  is_public: '',
  p_id: '',
  user_id: '',
  p_view_count: '',
  p_collect_count: '',
  p_share_count: '',
  p_comment_count: '',
  p_content: '',
  p_images: '',
  publish_time: '',
  user_avatar: '',
  username: '',
  is_collected: 0,
})
const getPostInfo = async () => {
  const res = await getPostDetailAPI(postId)
  postInfo.value = res.data.data[0]
}
getPostInfo()

const navigateToPostDetail = async () => {
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
</script>

<template>
  <div class="share-post" @click="navigateToPostDetail">
    <div class="title">
      <img :src="postInfo.user_avatar" alt="avatar" />
      <span>{{ postInfo.username }}</span>
    </div>
    <div class="content">{{ postInfo.p_content }}</div>
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
