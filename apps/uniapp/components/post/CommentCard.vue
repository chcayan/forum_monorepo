<script setup lang="ts">
import { lineBreakReplace } from '@/utils'
import type { CommentList } from '@/types'
import { formatDateByYear, getImgUrl } from '@/utils'
import ReportIcon from '@/components/icon/ReportIcon.vue'
import { createCommentReportAPI } from '../../api'

const { comment } = defineProps<{
  comment: CommentList
}>()

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
        await createCommentReportAPI({
          commentId: comment.commentId,
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
  <view class="comment-card">
    <view class="header">
      <image
        class="comment-card-img"
        :src="getImgUrl(comment.userAvatar)"
        mode="aspectFill"
      />
      <view class="comment-card-info">
        <view class="left">
          <text>{{ comment?.username }}</text>
          <text class="time">{{ formatDateByYear(comment.createdTime) }}</text>
        </view>
        <view class="right">
          <ReportIcon @click="openReportModal" />
        </view>
      </view>
    </view>
    <view class="main">
      <rich-text
        style="font-size: 16px"
        :nodes="lineBreakReplace(comment?.content)"
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
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      aspect-ratio: 1;
      border-radius: 50%;
    }

    .comment-card-info {
      width: calc(100% - 40px);
      display: flex;
      align-items: center;

      .left {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }

      .right {
        margin-left: auto;
      }

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
