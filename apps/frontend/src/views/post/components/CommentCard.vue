<script setup lang="ts">
import ReportSvg from '@/components/svgIcon/ReportSvg.vue'
import { getImgUrl, lineBreakReplace } from '@/utils'
import type { CommentList } from '@forum-monorepo/types'
import { formatDateByYear } from '@forum-monorepo/utils'
import CommentReportModal from './CommentReportModal.vue'
import { ref } from 'vue'

const { comment } = defineProps<{
  comment: CommentList
}>()

const showReportModal = ref(false)

function wheelEvent(e: WheelEvent) {
  e.stopPropagation()
  e.preventDefault()
}

function touchEvent(e: TouchEvent) {
  e.stopPropagation()
  e.preventDefault()
}

const openReportModal = () => {
  showReportModal.value = true
  document.body.addEventListener('wheel', wheelEvent, { passive: false })
  document.body.addEventListener('touchmove', touchEvent, { passive: false })
}

const closeReportModal = () => {
  showReportModal.value = false
  document.body.removeEventListener('wheel', wheelEvent)
  document.body.removeEventListener('touchmove', touchEvent)
}
</script>

<template>
  <div class="comment-card">
    <div class="header">
      <img :src="getImgUrl(comment.userAvatar)" alt="avatar" />
      <div class="box">
        <div class="left">
          <span>{{ comment?.username }}</span>
          <span class="time">{{ formatDateByYear(comment.createdTime) }}</span>
        </div>
        <div class="right">
          <ReportSvg @click="openReportModal" />
        </div>
      </div>
    </div>
    <div class="main">
      <div v-html="lineBreakReplace(comment?.content)"></div>
    </div>
  </div>
  <CommentReportModal
    :commentId="comment.commentId"
    :isOpen="showReportModal"
    @closeReportModal="closeReportModal"
  />
</template>

<style scoped lang="scss">
$main-gap: 20px;
.comment-card {
  .header {
    display: flex;
    align-items: center;
    gap: calc($main-gap / 2);
    overflow: hidden;

    img {
      width: 32px;
      height: 32px;
      aspect-ratio: 1;
      border-radius: 50%;
      cursor: pointer;
    }

    .box {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;

      .left {
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

      .right {
        opacity: 0;
        transition: opacity 0.2s ease;
      }
    }
  }

  .main {
    margin: calc($main-gap / 2) $main-gap 0 42px;
    line-height: 1.5;
  }
}

.comment-card:hover {
  .right {
    opacity: 1 !important;
  }
}
</style>
