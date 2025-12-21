<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import PostCard from '@/components/post/PostCard.vue'
import type { CommentList, PostDetail } from '@/types'
import { getCommentListAPI, getPostDetailAPI } from '@/api'
import CommentInput from '@/components/post/CommentInput.vue'
import CommentCard from '@/components/post/CommentCard.vue'
import emitter from '@/utils/eventEmitter'
import { onLoad } from '@dcloudio/uni-app'
import { RouterPath } from '../../../utils'

const postDetail = ref<PostDetail>({
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

const getPostDetail = async (postId: string) => {
  await getPostDetailAPI(postId)
    .then((res) => {
      postDetail.value = res.data.data[0]
    })
    .catch(() => {
      uni.redirectTo({
        url: RouterPath.notFound,
      })
    })
}

const commentList = ref<CommentList[]>()

const getCommentList = async (postId: string) => {
  const res = await getCommentListAPI(postId)
  commentList.value = res.data.data
}

onLoad((options) => {
  getPostDetail(options.postId)
  getCommentList(options.postId)
})

let off1 = emitter.on('EVENT:UPDATE_POST_DETAIL', async (postId: string) => {
  await getPostDetail(postId)
  emitter.emit('EVENT:TOGGLE_FLAG')
})

let off2 = emitter.on('EVENT:UPDATE_COMMENT_LIST', (postId: string) => {
  getCommentList(postId)
})

onUnmounted(() => {
  off1?.()
  off2?.()
})
</script>

<template>
  <view v-if="postDetail.p_id" class="post-detail">
    <view class="post">
      <PostCard :post="postDetail" :is-restrict-line="false" />
    </view>

    <view class="comment-list" v-if="commentList?.length">
      <view
        class="comment-item"
        v-for="comment in commentList"
        :key="comment.comment_id"
      >
        <CommentCard :comment="comment" />
      </view>
    </view>
    <view
      v-else
      class="comment-list"
      style="text-align: center; padding: 10px 0"
    >
      <text style="font-size: 16px">暂时没有评论</text>
    </view>
    <CommentInput />
  </view>
</template>

<style scoped lang="scss">
.post-detail {
  display: flex;
  flex-direction: column;
  padding: 10px 10px 90px;
  box-sizing: border-box;
  gap: 10px;
  border-radius: 10px;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));

  .post {
    box-shadow: $theme-light-shadow-color;
  }

  .comment-list {
    width: 100%;
    max-height: calc(100vh - 180px);
    overflow-y: scroll;
    border-radius: 10px;
    box-shadow: $theme-light-shadow-color;

    .comment-item {
      height: auto;
      padding: 10px;
    }
  }
}
</style>
