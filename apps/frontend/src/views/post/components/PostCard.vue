<script setup lang="ts">
import FollowButton from './FollowButton.vue'
import ViewSvg from '@/components/svgIcon/ViewSvg.vue'
import CommentSvg from '@/components/svgIcon/CommentSvg.vue'
import CollectSvg from '@/components/svgIcon/CollectSvg.vue'
import ShareSvg from '@/components/svgIcon/ShareSvg.vue'
import type { PostDetail, PostInfo } from '@forum-monorepo/types'
import { formatDateByYear } from '@forum-monorepo/utils'
import { checkLoginStatus, lineBreakReplace, Toast } from '@/utils'
import NGrid from './NGrid.vue'
import {
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import emitter from '@/utils/eventEmitter'
import router, { RouterPath } from '@/router'
import {
  updatePostViewAPI,
  updateUserAddCollectAPI,
  updateUserDelCollectAPI,
} from '@/api'
import { useRoute } from 'vue-router'

const { post, isRestrictLine } = defineProps<{
  post: PostInfo | PostDetail
  isRestrictLine: boolean
}>()

const postRef = useTemplateRef('postEl')

onMounted(() => {
  let lastKey: string | null = null
  window.addEventListener('keydown', (e) => (lastKey = e.key))

  window.addEventListener('focusin', (e) => {
    if (lastKey !== 'Tab') return
    if (e.target === postRef.value) {
      emitter.emit('TAB:CLOSE_AVATAR_WIDGET')
    }
  })
})

const route = useRoute()
const navigateToPostDetail = async (e: MouseEvent | KeyboardEvent) => {
  if (route.path.startsWith(RouterPath.post)) return
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG') return
  router.push(`${RouterPath.post}/${post.p_id}`)
  await updatePostViewAPI(post.p_id)
  emitter.emit('EVENT:UPDATE_POST_LIST')
}

const isCollect = ref(false)

const initCollectStatus = async () => {
  isCollect.value = post.is_collected ? true : false
}
initCollectStatus()

let flag = true
let off: () => void | null
const changeCollectStatus = async () => {
  if (!flag) return
  flag = false
  if (!checkLoginStatus()) return
  if (!isCollect.value) {
    await updateUserAddCollectAPI({
      postId: post.p_id,
    })
    Toast.show({
      msg: '收藏成功',
      type: 'success',
    })
  } else {
    await updateUserDelCollectAPI({
      postId: post.p_id,
    })
    Toast.show({
      msg: '取消收藏成功',
      type: 'success',
    })
  }

  emitter.emit('EVENT:UPDATE_POST_LIST')
  if (route.path.startsWith(RouterPath.post)) {
    emitter.emit('EVENT:UPDATE_POST_DETAIL')
  }
  off = emitter.on('EVENT:TOGGLE_FLAG', setFlag)
}

function setFlag() {
  flag = true
}

watch(
  () => post.is_collected,
  () => initCollectStatus()
)

onUnmounted(() => {
  console.log('clear')
  off?.()
})

onDeactivated(() => {
  off?.()
})
</script>

<template>
  <article
    ref="postEl"
    tabindex="0"
    class="tab-focus-style post-card"
    @keydown.enter="navigateToPostDetail"
  >
    <header>
      <img v-loading loading="lazy" :src="post.user_avatar" alt="avatar" />
      <div>
        <p class="name">{{ post.username }}</p>
        <p class="time">{{ formatDateByYear(post.publish_time) }}</p>
      </div>
      <FollowButton />
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
