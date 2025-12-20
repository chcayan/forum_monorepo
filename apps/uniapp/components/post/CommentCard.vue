<script setup lang="ts">
import { lineBreakReplace } from '@/utils'
import type { CommentList } from '@/types'
import { formatDateByYear, getImgUrl } from '@/utils'

const { comment } = defineProps<{
  comment: CommentList
}>()
</script>

<template>
  <view class="comment-card">
    <view class="header">
      <image
        class="comment-card-img"
        :src="getImgUrl(comment.user_avatar)"
        mode="aspectFill"
      />
      <view class="comment-card-info">
        <text>{{ comment?.username }}</text>
        <text class="time">{{ formatDateByYear(comment.created_time) }}</text>
      </view>
    </view>
    <view class="main">
      <rich-text
        style="font-size: 16px"
        :nodes="lineBreakReplace(comment?.c_content)"
      ></rich-text>
    </view>
  </view>
</template>

<style scoped lang="scss">
$main-gap: 20px;

.comment-card {
  .header {
    display: flex;
    align-items: center;
    gap: calc($main-gap / 2);

    .comment-card-img {
      width: 32px;
      height: 32px;
      aspect-ratio: 1;
      border-radius: 50%;
    }

    .comment-card-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-size: 14px;

      .time {
        font-size: 11px;
      }
    }
  }

  .main {
    margin: calc($main-gap / 2) $main-gap 0 42px;
    line-height: 1.5;
  }
}
</style>
