<script setup lang="ts">
import {
  RouterPath,
  formatDateByYear,
  getCurrentRoute,
  lineBreakReplace,
  getImgUrl,
} from '@/utils/index'
import { PostDetail } from '@/types/index'
import ViewIcon from '@/components/icon/ViewIcon.vue'
import CommentIcon from '@/components/icon/CommentIcon.vue'
import CollectIcon from '@/components/icon/CollectIcon.vue'
import ShareIcon from '@/components/icon/ShareIcon.vue'
import NGrid from '@/components/post/NGrid.vue'
import { ref } from 'vue'
import emitter from '@/utils/eventEmitter'
import {
  deleteUserPostAPI,
  updatePostViewAPI,
  updateUserAddCollectAPI,
  updateUserDelCollectAPI,
  updateUserPostToPrivateAPI,
  updateUserPostToPublicAPI,
} from '@/api'

const props = defineProps<{
  post: PostDetail
  isRestrictLine: Boolean
}>()

const isCollect = ref(false)
const changeCollectStatus = () => {}
const onShare = () => {}

const navigateToPostDetail = async (postId: string) => {
  const currentRoute = getCurrentRoute()
  const targetRoute = RouterPath.detail

  if (currentRoute === targetRoute) {
    console.log('not navigate')
    return
  }

  uni.navigateTo({
    url: `${RouterPath.detail}?postId=${postId}`,
  })

  await updatePostViewAPI(postId)
    .then(() => {
      console.log(333)
      emitter.emit('EVENT:UPDATE_POST_LIST', postId)
      emitter.emit('EVENT:UPDATE_USER_POST_LIST', postId)
    })
    .catch(() => {
      console.log(666)
      // router.replace(RouterPath.notFound)
      return
    })
}
</script>

<template>
  <view class="post-card">
    <view class="header">
      <image
        class="avatar"
        :src="getImgUrl(props.post?.user_avatar)"
        mode="aspectFill"
      />
      <view class="post-info">
        <text>{{ props.post?.username }}</text>
        <text class="date">{{
          formatDateByYear(props.post?.publish_time)
        }}</text>
      </view>
    </view>
    <view class="main">
      <rich-text
        @click="navigateToPostDetail(props.post.p_id)"
        :class="{ 'restrict-line': isRestrictLine }"
        :nodes="lineBreakReplace(props.post?.p_content)"
        class="text"
      ></rich-text>
      <NGrid :images="props.post?.p_images"></NGrid>
    </view>
    <view class="footer">
      <view class="icon-list">
        <view class="icon-item">
          <ViewIcon class="svg" /><text>{{ post?.p_view_count }}</text>
        </view>
        <view class="icon-item">
          <CommentIcon class="svg" /><text>{{ post?.p_comment_count }}</text>
        </view>
        <view @click="changeCollectStatus" class="icon-item">
          <CollectIcon :isCollect="isCollect" class="svg" />
          <text>{{ post?.p_collect_count }}</text>
        </view>
        <view @click="onShare" class="icon-item">
          <ShareIcon class="svg" /><text>{{ post?.p_share_count }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.post-card {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;

  .header {
    display: flex;
    flex-direction: row;
    height: 40px;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      margin-right: 10px;
    }

    .post-info {
      display: flex;
      flex-direction: column;

      .date {
        margin-top: 2px;
        font-size: 10px;
        opacity: 0.8;
      }
    }
  }

  .main {
    margin: 10px 0;

    .text {
      display: -webkit-box;
      line-height: 1.5;
      overflow: hidden;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      margin-bottom: 10px;
    }

    .restrict-line {
      line-clamp: $post-text-line;
      -webkit-line-clamp: $post-text-line;
    }
  }

  .footer {
    .icon-list {
      display: flex;

      .icon-item {
        display: flex;
        align-items: center;
        flex: 1;

        .svg {
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0.6);
          width: 32px;
          height: 32px;
        }
      }
    }
  }
}
</style>
