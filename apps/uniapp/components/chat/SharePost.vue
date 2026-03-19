<script setup lang="ts">
import { getPostDetailAPI, updatePostViewAPI } from '@/api'
import emitter from '@/utils/eventEmitter'
import { RouterPath, getImgUrl } from '@/utils'
import type { PostDetail } from '@/types'
import { ref } from 'vue'
import { useStatusStore } from '@/stores'
import WarnIcon from '@/components/icon/WarnIcon.vue'

const statusStore = useStatusStore()

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
  if (!postId) return
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
    v-if="!isHide"
    class="share-post"
    @click="navigateToPostDetail"
    :class="{ 'theme-share-post': statusStore.isDarkMode }"
  >
    <view class="content">{{ postInfo.pContent }}</view>
    <view class="title">
      <image
        class="img"
        mode="aspectFill"
        :src="getImgUrl(postInfo.userAvatar)"
      />
      <text style="font-size: 12px">{{ postInfo.username }}</text>
    </view>
  </view>
  <view
    v-else
    class="share-post unwatch"
    :class="{ 'theme-share-post': statusStore.isDarkMode }"
    style="height: 38px !important; width: fit-content"
  >
    <WarnIcon />
    <p>该帖子暂时不可见</p>
  </view>
</template>

<style scoped lang="scss">
.theme-share-post {
  background-color: $theme-dark-chat-speech-bubble-color !important;
}

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
  background-color: $theme-light-chat-speech-bubble-color;
  cursor: pointer;
  box-sizing: border-box;

  .title {
    display: flex;
    align-items: center;
    height: 20px;
    gap: 8px;
    align-self: flex-end;

    .img {
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
    font-size: 14px;
  }
}
</style>
