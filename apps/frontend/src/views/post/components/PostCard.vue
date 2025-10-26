<script setup lang="ts">
import FollowButton from './FollowButton.vue'
import ViewSvg from '@/components/svgIcon/ViewSvg.vue'
import CommentSvg from '@/components/svgIcon/CommentSvg.vue'
import CollectSvg from '@/components/svgIcon/CollectSvg.vue'
import ShareSvg from '@/components/svgIcon/ShareSvg.vue'
import type { PostInfo } from '@forum-monorepo/types'
import { formatDateByYear } from '@forum-monorepo/utils'
import { lineBreakReplace } from '@/utils'
import NGrid from './NGrid.vue'
import { onMounted, useTemplateRef } from 'vue'
import emitter from '@/utils/eventEmitter'
import router, { RouterPath } from '@/router'

const { post } = defineProps<{
  post: PostInfo
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

const navigateToPostDetail = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target && target.tagName === 'IMG') return
  router.push(`${RouterPath.post}/${post.p_id}`)
}
</script>

<template>
  <article ref="postEl" tabindex="0" class="tab-focus-style">
    <header>
      <img v-loading loading="lazy" :src="post.user_avatar" alt="avatar" />
      <div>
        <p class="name">{{ post.username }}</p>
        <p class="time">{{ formatDateByYear(post.publish_time) }}</p>
      </div>
      <FollowButton />
    </header>
    <div class="main" @click="navigateToPostDetail">
      <p v-html="lineBreakReplace(post.p_content)"></p>
      <NGrid class="n-grid" v-if="post.p_images" :images="post.p_images" />
    </div>
    <footer>
      <ul>
        <li><ViewSvg class="svg" /><span>0</span></li>
        <li><CommentSvg class="svg" /><span>0</span></li>
        <li><CollectSvg class="svg" /><span>0</span></li>
        <li><ShareSvg class="svg" /><span>0</span></li>
      </ul>
    </footer>
  </article>
</template>

<style scoped lang="scss">
article {
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
    cursor: pointer;

    .n-grid {
      margin-top: $gap;
      width: 100%;
    }
  }

  footer {
    ul {
      display: flex;

      li {
        display: flex;
        align-items: center;
        flex: 1;
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
