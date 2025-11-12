<script setup lang="ts">
import ViewSvg from '@/components/svgIcon/ViewSvg.vue'
import CommentSvg from '@/components/svgIcon/CommentSvg.vue'
import CollectSvg from '@/components/svgIcon/CollectSvg.vue'
import ShareSvg from '@/components/svgIcon/ShareSvg.vue'
import type { PostDetail, PostInfo } from '@forum-monorepo/types'
import { formatDateByYear } from '@forum-monorepo/utils'
import { checkLoginStatus, lineBreakReplace, Toast } from '@/utils'
import NGrid from './NGrid.vue'
import { computed, onDeactivated, onUnmounted, ref, watch } from 'vue'
import emitter from '@/utils/eventEmitter'
import router, { RouterPath } from '@/router'
import {
  updatePostViewAPI,
  updateUserAddCollectAPI,
  updateUserDelCollectAPI,
} from '@/api'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const { post, isRestrictLine } = defineProps<{
  post: PostInfo | PostDetail
  isRestrictLine: boolean
}>()

const route = useRoute()
const navigateToPostDetail = async (e: MouseEvent | KeyboardEvent) => {
  if (route.path.startsWith(RouterPath.post)) return
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG') return
  router.push(`${RouterPath.post}/${post.p_id}`)
  await updatePostViewAPI(post.p_id)
  emitter.emit('EVENT:UPDATE_POST_LIST', post.p_id)
  emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.p_id)
}

const isCollect = ref(false)

watch(
  () => userStore.userCollectListOfPostId,
  () => {
    if (userStore.userCollectListOfPostId.includes(post.p_id)) {
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
    await updateUserAddCollectAPI({
      postId: post.p_id,
    }).catch()
    await userStore.getUserCollectListOfPostId().catch()
    Toast.show({
      msg: '收藏成功',
      type: 'success',
    })
  } else {
    await updateUserDelCollectAPI({
      postId: post.p_id,
    }).catch()
    await userStore.getUserCollectListOfPostId().catch()
    Toast.show({
      msg: '取消收藏成功',
      type: 'success',
    })
  }

  if (
    route.path === RouterPath.base ||
    route.path.startsWith(RouterPath.my) ||
    route.path.startsWith(RouterPath.user)
  ) {
    emitter.emit('EVENT:UPDATE_POST_LIST', post.p_id)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.p_id)
  }

  if (route.path.startsWith(RouterPath.post)) {
    emitter.emit('EVENT:UPDATE_POST_DETAIL')
    emitter.emit('EVENT:UPDATE_POST_LIST', post.p_id)
    emitter.emit('EVENT:UPDATE_USER_POST_LIST', post.p_id)
  }
  off = emitter.on('EVENT:TOGGLE_FLAG', setFlag)
}

function setFlag() {
  flag = true
}

onUnmounted(() => {
  console.log('clear')
  off?.()
})

onDeactivated(() => {
  off?.()
})

const user_avatar = computed(() => {
  if (post.user_id === userStore.userInfo.user_id) {
    return userStore.userInfo.user_avatar
  } else {
    return post.user_avatar
  }
})

const username = computed(() => {
  if (post.user_id === userStore.userInfo.user_id) {
    return userStore.userInfo.username
  } else {
    return post.username
  }
})

const navigateToUser = () => {
  if (route.params?.userId === post.user_id) return
  if (post.user_id === userStore.userInfo.user_id) {
    router.push(RouterPath.my)
    return
  }
  emitter.emit('EVENT:REACTIVE_USER_VIEW', post.user_id)
  router.push(`${RouterPath.user}/${post.user_id}`)
}
</script>

<template>
  <article
    tabindex="0"
    class="tab-focus-style post-card"
    @keydown.enter="navigateToPostDetail"
  >
    <header>
      <img
        v-loading
        loading="lazy"
        :src="user_avatar"
        alt="avatar"
        @click="navigateToUser"
      />
      <div>
        <p class="name" @click="navigateToUser">
          {{ username }}
        </p>
        <p class="time">{{ formatDateByYear(post.publish_time) }}</p>
      </div>
      <!-- <FollowButton /> -->
    </header>
    <div
      :class="{ 'main-cursor': !route.path.startsWith(RouterPath.post) }"
      class="main"
      @click="navigateToPostDetail"
    >
      <p
        v-html="lineBreakReplace(post.p_content)"
        :class="{ 'restrict-line': isRestrictLine }"
      ></p>
      <NGrid class="n-grid" v-if="post.p_images" :images="post.p_images" />
    </div>
    <footer>
      <ul>
        <li>
          <ViewSvg class="svg" /><span title="浏览数">{{
            post.p_view_count
          }}</span>
        </li>
        <li>
          <CommentSvg class="svg" /><span title="评论数">{{
            post.p_comment_count
          }}</span>
        </li>
        <li @click="changeCollectStatus">
          <CollectSvg :isCollect="isCollect" class="svg" /><span
            title="收藏数"
            >{{ post.p_collect_count }}</span
          >
        </li>
        <li><ShareSvg class="svg" /><span title="分享数">0</span></li>
      </ul>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.post-card {
  width: 100%;
  padding: $gap * 1;
  border-radius: $gap;
  box-shadow: 0 0 2px var(--theme-shadow-color);
  overflow: hidden;
  background-color: var(--theme-post-card-color);

  header {
    display: flex;
    gap: $gap;
    height: 40px;

    img {
      width: 32px;
      height: 32px;
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
    margin: $gap 0;

    p {
      display: -webkit-box;
      line-height: 1.5;
      overflow: hidden;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
    }

    .restrict-line {
      line-clamp: $post-text-line;
      -webkit-line-clamp: $post-text-line;
    }

    .n-grid {
      margin-top: $gap;
      width: 100%;
    }
  }

  .main-cursor {
    cursor: pointer;
  }

  footer {
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
