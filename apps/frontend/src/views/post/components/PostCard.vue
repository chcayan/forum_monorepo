<script setup lang="ts">
import ViewSvg from '@/components/svgIcon/ViewSvg.vue'
import CommentSvg from '@/components/svgIcon/CommentSvg.vue'
import CollectSvg from '@/components/svgIcon/CollectSvg.vue'
import ShareSvg from '@/components/svgIcon/ShareSvg.vue'
import type { FriendInfo, PostDetail } from '@forum-monorepo/types'
import { formatDateByYear } from '@forum-monorepo/utils'
import {
  checkLoginStatus,
  getImgUrl,
  lineBreakReplace,
  socket,
  Toast,
} from '@/utils'
import NGrid from './NGrid.vue'
import { computed, onDeactivated, onUnmounted, ref, watch } from 'vue'
import emitter from '@/utils/eventEmitter'
import router, { RouterPath } from '@/router'
import {
  deleteUserPostAPI,
  updatePostViewAPI,
  updateUserAddCollectAPI,
  updateUserDelCollectAPI,
  updateUserPostToPrivateAPI,
  updateUserPostToPublicAPI,
} from '@/api'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'
import DeleteSvg from '@/components/svgIcon/DeleteSvg.vue'
import PublicSvg from '@/components/svgIcon/PublicSvg.vue'
import PrivateSvg from '@/components/svgIcon/PrivateSvg.vue'
import ReviewLabel from './ReviewLabel.vue'
import ViolationReason from './ViolationReason.vue'
import ModifySvg from '@/components/svgIcon/ModifySvg.vue'
import ReportSvg from '@/components/svgIcon/ReportSvg.vue'
import ReportReasonModal from './ReportReasonModal.vue'

const userStore = useUserStore()

const { post, isRestrictLine } = defineProps<{
  post: PostDetail
  isRestrictLine: boolean
}>()

const route = useRoute()
const navigateToPostDetail = async (e: MouseEvent | KeyboardEvent) => {
  if (route.path.startsWith(RouterPath.post)) return
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG') return
  router.push(`${RouterPath.post}/${post.pId}`)
  await updatePostViewAPI(post.pId)
    .then(() => {
      emitter.emit('EVENT:UPDATE_POST_LIST', post.pId)
      emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.pId)
    })
    .catch(() => {
      router.replace(RouterPath.notFound)
      return
    })
}

const isCollect = ref(false)

watch(
  () => userStore.userCollectListOfPostId,
  () => {
    if (userStore.userCollectListOfPostId.includes(post?.pId)) {
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
  if (!isCollect.value) {
    await updateUserAddCollectAPI(post.pId).catch()
    await userStore.getUserCollectListOfPostId().catch()
    Toast.show({
      msg: '收藏成功',
      type: 'success',
    })
  } else {
    await updateUserDelCollectAPI(post.pId).catch()
    await userStore.getUserCollectListOfPostId().catch()
    Toast.show({
      msg: '取消收藏成功',
      type: 'success',
    })
  }

  updatePostStatus()

  off = emitter.on('EVENT:TOGGLE_FLAG', setFlag)
}

function updatePostStatus() {
  if (
    route.path === RouterPath.base ||
    route.path.startsWith(RouterPath.my) ||
    route.path.startsWith(RouterPath.user) ||
    route.path.startsWith(RouterPath.search)
  ) {
    emitter.emit('EVENT:UPDATE_POST_LIST', post.pId)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.pId)
  }

  if (route.path.startsWith(RouterPath.post)) {
    emitter.emit('EVENT:UPDATE_POST_DETAIL')
    emitter.emit('EVENT:UPDATE_POST_LIST', post.pId)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.pId)
  }
}

function setFlag() {
  flag = true
}

onUnmounted(() => {
  off?.()
})

onDeactivated(() => {
  off?.()
})

const userAvatar = computed(() => {
  if (!post) return
  if (post.userId === userStore.userInfo.userId) {
    return userStore.userInfo.userAvatar
  } else {
    return post.userAvatar
  }
})

const username = computed(() => {
  if (!post) return
  if (post.userId === userStore.userInfo.userId) {
    return userStore.userInfo.username
  } else {
    return post.username
  }
})

const navigateToUser = () => {
  if (route.params?.userId === post.userId) return
  if (post.userId === userStore.userInfo.userId) {
    router.push(RouterPath.my)
    return
  }
  // emitter.emit('EVENT:REACTIVE_USER_VIEW', post.user_id)
  router.push(`${RouterPath.user}/${post.userId}`)
}

const deletePost = () => {
  Toast.show({
    msg: '确定要删除吗',
    type: 'error',
    duration: 5000,
    eventFn: async () => {
      await deleteUserPostAPI(post.pId)
        .then(() => {
          Toast.show({
            msg: '删除成功',
            type: 'success',
          })
        })
        .catch(() => {
          Toast.show({
            msg: '删除失败',
            type: 'error',
          })
        })
      emitter.emit('EVENT:DELETE_USER_POST_LIST', post.pId)
    },
  })
}

const onPrivate = () => {
  Toast.show({
    msg: '确定要设置为仅自己可见吗',
    type: 'error',
    duration: 5000,
    eventFn: async () => {
      await updateUserPostToPrivateAPI(post.pId)
        .then(() => {
          Toast.show({
            msg: '设置成功',
            type: 'success',
          })
        })
        .catch(() => {
          Toast.show({
            msg: '设置失败',
            type: 'error',
          })
        })
      emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.pId)
    },
  })
}

const onPublic = () => {
  Toast.show({
    msg: '确定要设置为公开可见吗',
    type: 'error',
    duration: 5000,
    eventFn: async () => {
      await updateUserPostToPublicAPI(post.pId)
        .then(() => {
          Toast.show({
            msg: '设置成功',
            type: 'success',
          })
        })
        .catch(() => {
          Toast.show({
            msg: '设置失败',
            type: 'error',
          })
        })
      emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.pId)
    },
  })
}

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
    message: post.pId,
    isShare: '1',
  }

  socket.emit('sendMessage', payload)
  updatePostStatus()
  emitter.emit('EVENT:UPDATE_CHAT_RECORDS', friendId)
  Toast.show({
    msg: '分享成功',
    type: 'success',
  })
  flag = true
  showShareBox.value = false
}

const navigateToPublish = () => {
  router.push(`${RouterPath.publish}?edit-post=${post.pId}`)
}

const showReportModal = ref(false)

const openReportModal = () => {
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
}

const searchPostsByTag = (name: string) => {
  router.push(`${RouterPath.tag}?name=${name}`)
}
</script>

<template>
  <article
    tabindex="0"
    class="tab-focus-style post-card"
    :class="{ 'main-cursor': !route.path.startsWith(RouterPath.post) }"
    @click="navigateToPostDetail"
    @keydown.enter="navigateToPostDetail"
  >
    <div class="share-box" :class="{ 'show-share-box': showShareBox }">
      <p>请选择一位好友：</p>
      <ul tabindex="-1">
        <li
          @click.stop="share(friend.followId)"
          v-for="(friend, index) in friendList"
          :key="index"
        >
          <img :src="getImgUrl(friend.userAvatar)" alt="avatar" />
          <p class="name">{{ friend.username }}</p>
        </li>
      </ul>
    </div>
    <header>
      <img
        v-loading
        loading="lazy"
        :src="getImgUrl(userAvatar!)"
        alt="avatar"
        @click.stop="navigateToUser"
      />
      <div class="info">
        <p class="name" @click.stop="navigateToUser">
          {{ username }}
        </p>
        <p class="time">{{ formatDateByYear(post?.publishTime) }}</p>
      </div>
      <div
        class="func-widget"
        v-if="
          post?.userId === userStore.userInfo.userId &&
          route.path === RouterPath.my
        "
      >
        <DeleteSvg @click.stop="deletePost" />
        <ModifySvg @click.stop="navigateToPublish" />
        <div v-if="post.status === 1">
          <PublicSvg @click.stop="onPrivate" v-if="post?.isPublic === 'true'" />
          <PrivateSvg @click.stop="onPublic" v-else />
        </div>
        <div v-else>
          <ReviewLabel :status="post.status" />
        </div>
      </div>
      <div v-if="route.path.startsWith(RouterPath.post) && post.status === 1">
        <ReportSvg @click.stop="openReportModal" />
        <ReportReasonModal
          :postId="post.pId"
          :isOpen="showReportModal"
          @closeReportModal="closeReportModal"
        />
      </div>
    </header>
    <div class="main">
      <ViolationReason v-if="post.status === 2" :postId="post.pId" />
      <p
        v-html="lineBreakReplace(post?.pContent)"
        :class="{ 'restrict-line': isRestrictLine }"
      ></p>
      <NGrid
        class="n-grid"
        v-if="post?.pImages && post?.pImages.length"
        :images="post?.pImages"
        :postId="post.pId"
      />
      <ul class="tag-list" v-if="post.tags && post.tags.length">
        <li
          v-for="tag in post.tags"
          :key="tag"
          @click.stop="searchPostsByTag(tag)"
          :title="tag"
        >
          <span
            ><span style="font-weight: bold">#</span>&nbsp;&nbsp;{{ tag }}</span
          >
        </li>
      </ul>
    </div>
    <footer v-if="post.status === 1">
      <ul>
        <li>
          <ViewSvg class="svg" /><span title="浏览数">{{
            post?.pViewCount
          }}</span>
        </li>
        <li>
          <CommentSvg class="svg" /><span title="评论数">{{
            post?.pCommentCount
          }}</span>
        </li>
        <li @click.stop="changeCollectStatus" style="cursor: pointer">
          <CollectSvg :isCollect="isCollect" class="svg" /><span
            style="cursor: pointer"
            title="收藏数"
            >{{ post?.pCollectCount }}</span
          >
        </li>
        <li @click.stop="onShare" style="cursor: pointer">
          <ShareSvg class="svg" /><span
            style="cursor: pointer"
            title="分享数"
            >{{ post?.pShareCount }}</span
          >
        </li>
      </ul>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.main-cursor {
  cursor: pointer;
}

.post-card {
  width: 100%;
  padding: $gap * 1;
  border-radius: $gap;
  box-shadow: var(--theme-shadow-color);
  overflow: hidden;
  background-color: var(--theme-post-card-color);
  position: relative;

  .share-box {
    // display: none;
    position: absolute;
    bottom: 52px;
    right: 0;
    padding: 10px 0 10px 10px;
    background-color: var(--theme-color);
    box-shadow: var(--theme-shadow-color);
    border-radius: 10px;
    width: 150px;
    max-height: 200px;
    height: calc(100% - 52px);
    z-index: $share-box-z-index;
    transform: translateX(110%);
    transition: all 0.3s ease;
    overflow: hidden;

    ul {
      height: 100%;
      padding: 10px 0;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        width: 10px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: var(--theme-scrollbar-thumb-color);
      }

      li {
        display: flex;
        height: 40px;
        align-items: center;
        gap: 10px;
        cursor: pointer;

        .name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    p {
      font-size: 14px;
    }

    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      aspect-ratio: 1;
    }
  }

  .show-share-box {
    transform: translateX(0);
  }

  header {
    display: flex;
    gap: $gap;
    height: 34px;

    .info {
      margin-right: auto;

      .name {
        height: 20px;
      }

      .time {
        height: 14px;
      }
    }

    .func-widget {
      display: flex;
      cursor: pointer;
    }

    img {
      width: 34px;
      height: 34px;
      aspect-ratio: 1;
      border-radius: 50%;
      cursor: pointer;
    }

    div {
      .name {
        cursor: pointer;
      }

      .time {
        font-size: 10px;
      }
    }

    button {
      margin-left: auto;
    }
  }

  .main {
    margin: $gap 0 0;

    p {
      display: -webkit-box;
      line-height: 1.5;
      overflow: hidden;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      // word-break: break-all;
      overflow-wrap: anywhere;
    }

    .restrict-line {
      line-clamp: $post-text-line;
      -webkit-line-clamp: $post-text-line;
    }

    .n-grid {
      margin-top: $gap;
      width: 100%;

      @media (max-width: $mobile-size) {
        width: calc(100vw - 50px);
      }
    }

    .tag-list {
      margin-top: 10px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;

      li {
        display: flex;
        align-items: center;
        height: 30px;
        padding: 5px 10px;
        background-color: var(--theme-textarea-bg-color);
        border-radius: 5px;

        span {
          font-size: 13px;
        }
      }
    }
  }

  footer {
    margin-top: 10px;

    ul {
      display: flex;

      li {
        display: flex;
        align-items: center;
        flex: 1;

        span {
          cursor: default;
        }
        // gap: $gap;

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
