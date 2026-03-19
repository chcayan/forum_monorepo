<script setup lang="ts">
import {
  RouterPath,
  formatDateByYear,
  getCurrentRoute,
  lineBreakReplace,
  getImgUrl,
  checkLoginStatus,
  socket,
} from '@/utils/index'
import { FriendInfo, PostDetail } from '@/types/index'
import ViewIcon from '@/components/icon/ViewIcon.vue'
import CommentIcon from '@/components/icon/CommentIcon.vue'
import CollectIcon from '@/components/icon/CollectIcon.vue'
import ShareIcon from '@/components/icon/ShareIcon.vue'
import DelIcon from '@/components/icon/DelIcon.vue'
import PublicIcon from '@/components/icon/PublicIcon.vue'
import PrivateIcon from '@/components/icon/PrivateIcon.vue'
import ReportIcon from '@/components/icon/ReportIcon.vue'
import ModifyIcon from '@/components/icon/ModifyIcon.vue'
import NGrid from '@/components/post/NGrid.vue'
import ReviewLabel from '@/components/post/ReviewLabel.vue'
import ViolationReason from '@/components/post/ViolationReason.vue'
import { ref, watch, computed } from 'vue'
import emitter from '@/utils/eventEmitter'
import {
  createPostReportAPI,
  deleteUserPostAPI,
  updatePostViewAPI,
  updateUserAddCollectAPI,
  updateUserDelCollectAPI,
  updateUserPostToPrivateAPI,
  updateUserPostToPublicAPI,
} from '@/api'
import { useStatusStore, useUserStore } from '@/stores'
import { onShow, onLoad, onPageScroll } from '@dcloudio/uni-app'

const statusStore = useStatusStore()

const props = defineProps<{
  post: PostDetail
  isRestrictLine: Boolean
}>()

const userAvatar = computed(() => {
  if (!props.post) return
  if (props.post.userId === userStore.userInfo.userId) {
    return getImgUrl(userStore.userInfo.userAvatar)
  } else {
    return getImgUrl(props.post.userAvatar)
  }
})

const username = computed(() => {
  if (!props.post) return
  if (props.post.userId === userStore.userInfo.userId) {
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
    if (userStore.userCollectListOfPostId.includes(props.post?.pId)) {
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
      await updateUserAddCollectAPI(props.post.pId)
      await userStore.getUserCollectListOfPostId()
      uni.showToast({
        icon: 'none',
        title: '收藏成功',
      })
    } else {
      await updateUserDelCollectAPI(props.post.pId)
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
  const route = getCurrentRoute()!

  if (
    route === RouterPath.index ||
    route.startsWith(RouterPath.my) ||
    route.startsWith(RouterPath.user) ||
    route.startsWith(RouterPath.search)
  ) {
    emitter.emit('EVENT:UPDATE_POST_LIST', props.post.pId)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.pId)
  }

  if (route.startsWith(RouterPath.detail)) {
    emitter.emit('EVENT:UPDATE_POST_DETAIL', props.post.pId)
    emitter.emit('EVENT:UPDATE_POST_LIST', props.post.pId)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.pId)
  }
}

function setFlag() {
  flag = true
}

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

const navigateToPublish = () => {
  uni.setStorageSync('query', { postId: props.post.pId })
  uni.switchTab({
    url: RouterPath.publish,
  })
}

const deletePost = () => {
  uni.showModal({
    content: '确定要删除吗',
    confirmText: '删除',
    confirmColor: '#ff0000',
    async success(result: any) {
      if (result.confirm) {
        await deleteUserPostAPI(props.post.pId)
          .then(() => {
            uni.showToast({
              icon: 'none',
              title: '删除成功',
            })
            emitter.emit('EVENT:DELETE_USER_POST_LIST', props.post.pId)
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
    async success(result: any) {
      if (result.confirm) {
        await updateUserPostToPublicAPI(props.post.pId)
          .then(() => {
            uni.showToast({
              icon: 'none',
              title: '设置成功',
            })
            emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.pId)
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
    content: '确定要设置为仅自己可见吗',
    async success(result: any) {
      if (result.confirm) {
        await updateUserPostToPrivateAPI(props.post.pId)
          .then(() => {
            uni.showToast({
              icon: 'none',
              title: '设置成功',
            })
            emitter.emit('EVENT:UPDATE_USER_POST_LIST', props.post.pId)
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

const id = ref('')
onLoad((options) => {
  id.value = options?.userId
})

const navigateToUser = () => {
  if (id.value === props.post.userId) return
  // emitter.emit('EVENT:REACTIVE_USER_VIEW', post.userId)
  uni.navigateTo({
    url: `${RouterPath.user}?userId=${props.post.userId}`,
  })
}

const isSelf = ref(false)
const isPostDetail = ref(false)
onShow(() => {
  const route = getCurrentRoute()
  isSelf.value =
    props.post?.userId === userStore.userInfo.userId && route === RouterPath.my
  isPostDetail.value = route === RouterPath.detail
})

const showShareBox = ref(false)

const friendList = computed<FriendInfo[]>(() => {
  return userStore.userFriendList
})

const onShare = () => {
  if (!checkLoginStatus()) return
  showShareBox.value = !showShareBox.value
}

const share = async (friendId: string) => {
  const payload = {
    from: userStore.userInfo.userId,
    to: friendId,
    message: props.post.pId,
    isShare: '1',
  }

  socket.emit('sendMessage', payload)
  updatePostStatus()
  emitter.emit('EVENT:UPDATE_CHAT_RECORDS', friendId, props.post.pId)
  uni.showToast({
    icon: 'none',
    title: '分享成功',
  })
  showShareBox.value = false
}

onPageScroll(() => {
  if (!showShareBox.value) return
  showShareBox.value = false
})

const openReportModal = () => {
  uni.showModal({
    title: '请填写举报原因：',
    editable: true,
    confirmText: '提交',
    async success(result) {
      if (result.confirm) {
        if (!result.content?.trim()) {
          uni.showToast({
            icon: 'none',
            title: '内容不为空',
          })
          return
        }
        await createPostReportAPI({
          postId: props.post.pId,
          reason: result.content.trim(),
        })
        uni.showToast({
          icon: 'none',
          title: '提交成功，等待审核中',
        })
      }
    },
  })
}
</script>

<template>
  <view class="post-card">
    <view
      class="share-box"
      :class="{
        'show-share-box': showShareBox,
        'theme-share-box': statusStore.isDarkMode,
      }"
    >
      <text style="font-size: 12px">请选择一位好友：</text>
      <view class="ul">
        <view
          class="li"
          @click="share(friend.followId)"
          v-for="(friend, index) in friendList"
          :key="index"
        >
          <image
            mode="aspectFill"
            class="img"
            :src="getImgUrl(friend.userAvatar)"
          />
          <text class="name">{{ friend.username }}</text>
        </view>
        <view style="height: 10px"></view>
      </view>
    </view>
    <view class="header">
      <image
        class="avatar"
        :src="userAvatar"
        mode="aspectFill"
        @click="navigateToUser()"
      />
      <view class="post-info">
        <text style="font-size: 16px" @click="navigateToUser()">{{
          username
        }}</text>
        <text class="date">{{
          formatDateByYear(props.post?.publishTime)
        }}</text>
      </view>
      <view class="func-widget" v-if="isSelf">
        <DelIcon @click="deletePost" />
        <ModifyIcon @click="navigateToPublish" />
        <view v-if="post.status === 1">
          <PublicIcon
            @click="onPrivate"
            v-if="props.post?.isPublic === 'true'"
          />
          <PrivateIcon @click="onPublic" v-else />
        </view>
        <view v-else>
          <ReviewLabel :status="props.post?.status" />
        </view>
      </view>
      <view v-if="isPostDetail && props.post.status === 1">
        <ReportIcon @click="openReportModal" />
      </view>
    </view>
    <view class="main">
      <ViolationReason
        v-if="props.post.status === 2"
        :postId="props.post.pId"
      />
      <rich-text
        style="font-size: 16px"
        @click="navigateToPostDetail(props.post.pId)"
        :class="{ 'restrict-line': isRestrictLine }"
        :nodes="lineBreakReplace(props.post?.pContent)"
        class="text"
      ></rich-text>
      <NGrid
        class="imgs"
        :images="props.post?.pImages"
        :postId="props.post.pId"
      ></NGrid>
    </view>
    <view class="footer" v-if="post.status === 1">
      <view class="icon-list">
        <view class="icon-item">
          <ViewIcon class="svg" /><text class="count">{{
            post?.pViewCount
          }}</text>
        </view>
        <view class="icon-item">
          <CommentIcon class="svg" /><text class="count">{{
            post?.pCommentCount
          }}</text>
        </view>
        <view @click="changeCollectStatus" class="icon-item">
          <CollectIcon :isCollect="isCollect" class="svg" />
          <text class="count">{{ post?.pCollectCount }}</text>
        </view>
        <view @click="onShare" class="icon-item">
          <ShareIcon class="svg" /><text class="count">{{
            post?.pShareCount
          }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.theme-share-box {
  background-color: $theme-dark-color !important;
  box-shadow: $theme-dark-shadow-color !important;
}

.post-card {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  .share-box {
    position: absolute;
    bottom: 52px;
    right: 0;
    padding: 5px 0 10px 10px;
    background-color: $theme-light-color;
    box-shadow: $theme-light-shadow-color;
    border-radius: 10px;
    width: 150px;
    max-height: 200px;
    height: calc(100% - 52px);
    z-index: $share-box-z-index;
    transform: translateX(110%);
    transition: all 0.3s ease;
    overflow: hidden;
    box-sizing: border-box;

    .ul {
      height: 100%;
      padding: 10px 0;
      box-sizing: border-box;
      overflow-y: scroll;

      .li {
        display: flex;
        height: 40px;
        align-items: center;
        gap: 10px;

        .name {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      aspect-ratio: 1;
    }
  }

  .show-share-box {
    transform: translateX(0);
  }

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
      margin-right: auto;

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

        .count {
          font-size: 16px;
        }

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
