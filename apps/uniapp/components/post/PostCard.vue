<script setup lang="ts">
import {
  RouterPath,
  formatDateByYear,
  getCurrentRoute,
  lineBreakReplace,
  getImgUrl,
  checkLoginStatus,
} from '@/utils/index'
import { PostDetail } from '@/types/index'
import ViewIcon from '@/components/icon/ViewIcon.vue'
import CommentIcon from '@/components/icon/CommentIcon.vue'
import CollectIcon from '@/components/icon/CollectIcon.vue'
import ShareIcon from '@/components/icon/ShareIcon.vue'
import DelIcon from '@/components/icon/DelIcon.vue'
import PublicIcon from '@/components/icon/PublicIcon.vue'
import PrivateIcon from '@/components/icon/PrivateIcon.vue'
import NGrid from '@/components/post/NGrid.vue'
import { ref, watch, computed } from 'vue'
import emitter from '@/utils/eventEmitter'
import {
  deleteUserPostAPI,
  updatePostViewAPI,
  updateUserAddCollectAPI,
  updateUserDelCollectAPI,
  updateUserPostToPrivateAPI,
  updateUserPostToPublicAPI,
} from '@/api'
import { useUserStore } from '@/stores'
import { onShow } from '@dcloudio/uni-app'

const props = defineProps<{
  post: PostDetail
  isRestrictLine: Boolean
}>()

const user_avatar = computed(() => {
  if (!props.post) return
  if (props.post.user_id === userStore.userInfo.user_id) {
    return getImgUrl(userStore.userInfo.user_avatar)
  } else {
    return getImgUrl(props.post.user_avatar)
  }
})

const username = computed(() => {
  if (!props.post) return
  if (props.post.user_id === userStore.userInfo.user_id) {
    return userStore.userInfo.username
  } else {
    return props.post.username
  }
})

const isCollect = ref(false)

const userStore = useUserStore()

watch(
  () => userStore.userCollectListOfPostId,
  () => {
    if (userStore.userCollectListOfPostId.includes(props.post?.p_id)) {
      isCollect.value = true
    } else {
      isCollect.value = false
    }
  },
  {
    immediate: true,
  }
)

let flag = true
let off: () => void | null
const changeCollectStatus = async () => {
  if (!flag) return
  flag = false
  if (!checkLoginStatus()) {
    flag = true
    return
  }

  try {
    if (!isCollect.value) {
      await updateUserAddCollectAPI({
        postId: props.post.p_id,
      })
      await userStore.getUserCollectListOfPostId()
      uni.showToast({
        icon: 'none',
        title: '收藏成功',
      })
    } else {
      await updateUserDelCollectAPI({
        postId: props.post.p_id,
      })
      await userStore.getUserCollectListOfPostId()
      uni.showToast({
        icon: 'none',
        title: '取消收藏成功',
      })
    }
    updatePostStatus()
  } catch {
  } finally {
    off = emitter.on('EVENT:TOGGLE_FLAG', setFlag)
  }
}

function updatePostStatus() {
  const route = getCurrentRoute()

  if (
    route === RouterPath.index ||
    route.startsWith(RouterPath.my) ||
    route.startsWith(RouterPath.user) ||
    route.startsWith(RouterPath.search)
  ) {
    emitter.emit('EVENT:UPDATE_POST_LIST', props.post.p_id)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.p_id)
  }

  if (route.startsWith(RouterPath.detail)) {
    emitter.emit('EVENT:UPDATE_POST_DETAIL', props.post.p_id)
    emitter.emit('EVENT:UPDATE_POST_LIST', props.post.p_id)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.p_id)
  }
}

function setFlag() {
  flag = true
}

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
      emitter.emit('EVENT:UPDATE_POST_LIST', postId)
      emitter.emit('EVENT:UPDATE_USER_POST_LIST', postId)
    })
    .catch(() => {
      return
    })
}

const deletePost = () => {
  uni.showModal({
    content: '确定要删除吗',
    confirmText: '删除',
    confirmColor: '#ff0000',
    async success(result: string | boolean) {
      if (result.confirm) {
        await deleteUserPostAPI({
          postId: props.post.p_id,
        })
          .then(() => {
            uni.showToast({
              icon: 'none',
              title: '删除成功',
            })
          })
          .catch(() => {
            uni.showToast({
              icon: 'none',
              title: '删除失败',
            })
          })
      }
    },
  })
}

const onPublic = () => {
  uni.showModal({
    content: '确定要设置为公开可见吗',
    async success(result: string | boolean) {
      if (result.confirm) {
        await updateUserPostToPublicAPI({
          postId: props.post.p_id,
        })
          .then(() => {
            uni.showToast({
              icon: 'none',
              title: '设置成功',
            })
            emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.p_id)
          })
          .catch(() => {
            uni.showToast({
              icon: 'none',
              title: '设置失败',
            })
          })
      }
    },
  })
}

const onPrivate = () => {
  uni.showModal({
    content: '确定要设置为公开可见吗',
    async success(result: string | boolean) {
      if (result.confirm) {
        await updateUserPostToPrivateAPI({
          postId: props.post.p_id,
        })
          .then(() => {
            uni.showToast({
              icon: 'none',
              title: '设置成功',
            })
            emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.p_id)
          })
          .catch(() => {
            uni.showToast({
              icon: 'none',
              title: '设置失败',
            })
          })
      }
    },
  })
}

let route = getCurrentRoute()
onShow(() => {
  route = getCurrentRoute()
  // console.log(route);
  // console.log(props.post?.user_id === userStore.userInfo.user_id &&
  // route === RouterPath.my);
  console.log(route === RouterPath.my)
})
</script>

<template>
  <view class="post-card">
    <view class="header">
      <image class="avatar" :src="user_avatar" mode="aspectFill" />
      <view class="post-info">
        <text style="font-size: 16px">{{ username }}</text>
        <text class="date">{{
          formatDateByYear(props.post?.publish_time)
        }}</text>
      </view>
      <view
        class="func-widget"
        v-if="
          props.post?.user_id === userStore.userInfo.user_id &&
          route === RouterPath.my
        "
      >
        <DelIcon @click="deletePost" />
        <PublicIcon
          @click="onPrivate"
          v-if="props.post?.is_public === 'true'"
        />
        <PrivateIcon @click="onPublic" v-else />
      </view>
    </view>
    <view class="main">
      <rich-text
        style="font-size: 16px"
        @click="navigateToPostDetail(props.post.p_id)"
        :class="{ 'restrict-line': isRestrictLine }"
        :nodes="lineBreakReplace(props.post?.p_content)"
        class="text"
      ></rich-text>
      <NGrid class="imgs" :images="props.post?.p_images"></NGrid>
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
      width: 40px;
      height: 40px;
      border-radius: 9999px;
      margin-right: 10px;
    }

    .post-info {
      display: flex;
      flex-direction: column;

      .date {
        margin-top: 2px;
        font-size: 11px;
        opacity: 0.8;
      }
    }

    .func-widget {
      display: flex;
      gap: 10px;
      margin-left: auto;
      margin-right: 5px;
    }
  }

  .main {
    margin: 10px 0 0;

    .imgs {
      max-height: 500px;
      overflow: hidden;
      margin-bottom: 10px;
    }

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
