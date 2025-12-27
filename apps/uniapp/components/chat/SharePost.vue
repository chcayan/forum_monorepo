<script setup lang="ts">
import { getPostDetailAPI, updatePostViewAPI } from '@/api'
import emitter from '@/utils/eventEmitter'
import { RouterPath, getImgUrl } from '@/utils'
import type { PostDetail } from '@/types'
import { ref } from 'vue'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()

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
  uni.navigateTo({
    url: `${RouterPath.detail}?postId=${postId}`,
  })

  await updatePostViewAPI(postId)
    .then(() => {
      emitter.emit('EVENT:UPDATE_POST_LIST', postId)
      emitter.emit('EVENT:UPDATE_USER_POST_LIST', postId)
    })
    .catch(() => {
      uni.navigateTo({
        url: RouterPath.notFound,
      })
      return
    })
}
</script>

<template>
  <view
    class="share-post"
    @click="navigateToPostDetail"
    :class="{ theme: statusStore.isDarkMode }"
  >
    <view class="title">
      <image
        class="img"
        mode="aspectFill"
        :src="getImgUrl(postInfo.user_avatar)"
      />
      <text style="font-size: 14px">{{ postInfo.username }}</text>
    </view>
    <view class="content">{{ postInfo.p_content }}</view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-chat-speech-bubble-color !important;
}

.share-post {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 100px;
  border-radius: 10px;
  padding: 10px;
  background-color: $theme-light-chat-speech-bubble-color;
  cursor: pointer;
  box-sizing: border-box;

  .title {
    display: flex;
    align-items: center;
    height: 32px;
    gap: 8px;

    .img {
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
    font-size: 14px;
  }
}
</style>
