<script setup lang="ts">
import { lineBreakReplace } from '@/utils'
import type { CommentList } from '@forum-monorepo/types'
import { formatDateByYear } from '@forum-monorepo/utils'

const { comment } = defineProps<{
  comment: CommentList
}>()
</script>

<template>
  <div class="comment-card">
    <div class="header">
      <img :src="comment.user_avatar" alt="avatar" />
      <div>
        <span>{{ comment?.username }}</span>
        <span class="time">{{ formatDateByYear(comment.created_time) }}</span>
      </div>
    </div>
    <div class="main">
      <div v-html="lineBreakReplace(comment?.c_content)"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$main-gap: 20px;
.comment-card {
  .header {
    display: flex;
    align-items: center;
    gap: calc($main-gap / 2);

    img {
      width: 32px;
      height: 32px;
      aspect-ratio: 1;
      border-radius: 50%;
      cursor: pointer;
    }

    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 14px;

      span {
        cursor: pointer;
      }

      .time {
        font-size: 11px;
      }
    }
  }

  .main {
    margin: calc($main-gap / 2) $main-gap 0 42px;
  }
}
</style>
