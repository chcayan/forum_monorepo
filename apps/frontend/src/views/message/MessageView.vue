<script setup lang="ts">
import { getUserMessageAPI } from '@/api'
import router, { RouterPath } from '@/router'
import { UserMessage } from '@forum-monorepo/types'
import { formatTimeAgo } from '@forum-monorepo/utils'
import { onActivated, ref } from 'vue'

const userMuteTip = (punishTime: number) => {
  return `由于您在评论区发表了不当言论，您的账号已被禁言 ${punishTime} 小时。请遵守论坛规范。`
}

const userPostProhibitTip = (punishTime: number) => {
  return `由于您发布了不良帖子，您的账号已被禁止发贴 ${punishTime} 小时。请遵守论坛规范。`
}

const userLoginProhibitTip = (punishTime: number) => {
  return `由于您近期多次违反论坛规范，您的账号已被禁止登录 ${punishTime} 小时。请遵守论坛规范。`
}

type Tip = {
  (punishTime: number): string
}

const msgStatus = {
  post_review_pass: [
    '审核通过',
    '您的帖子已发布',
    '恭喜！您发布的帖子已经通过审核。',
  ],
  post_review_violate: [
    '审核未通过',
    '帖子未能通过审核',
    '很抱歉，您的帖子未能通过审核，请修改帖子内容。违规原因：',
  ],
  user_mute: ['违规处罚', '账号禁言通知', userMuteTip],
  user_post_prohibit: ['违规处罚', '账号禁止发贴通知', userPostProhibitTip],
  user_login_prohibit: ['违规处罚', '账号禁止登录通知', userLoginProhibitTip],
  system_announcement: ['系统公告', '版本更新说明', ''],
  post_violate: [
    '帖子违规',
    '您发布的帖子被举报',
    '很抱歉，您发布的帖子违反论坛规定，请修改帖子内容。违规原因：',
  ],
  comment_violate: [
    '评论违规',
    '您发布的评论被举报',
    '很抱歉，您发布的评论违反论坛规定，已删除该评论。违规原因：',
  ],
}

const userMsg = ref<UserMessage[]>()

const getUserMessage = async () => {
  const res = await getUserMessageAPI()
  const data: UserMessage[] = res.data.data
  userMsg.value = data
}

onActivated(() => {
  getUserMessage()
})

const navigateToPost = (status: UserMessage['status'], postId: string) => {
  if (status === 'post_review_violate' || status === 'post_violate') {
    router.push(`${RouterPath.post}/${postId}`)
  }
}
</script>

<template>
  <div class="message">
    <ul v-if="userMsg && userMsg?.length !== 0">
      <li v-for="item in userMsg" :key="item.id">
        <div class="head">
          <p :class="item.status">{{ msgStatus[item.status][0] }}</p>
          <p class="time">{{ formatTimeAgo(item.createdAt) }}</p>
        </div>
        <h3>{{ msgStatus[item.status][1] }}</h3>
        <p class="tip">
          {{
            item.status === 'user_mute' ||
            item.status === 'user_login_prohibit' ||
            item.status === 'user_post_prohibit'
              ? (msgStatus[item.status][2] as Tip)(item.punishTime)
              : msgStatus[item.status][2]
          }}{{
            item.status === 'post_violate' ||
            item.status === 'comment_violate' ||
            item.status === 'post_review_violate'
              ? item.content
              : ''
          }}
        </p>
        <div
          class="quote"
          v-if="
            item.status === 'post_review_violate' ||
            item.status === 'post_violate' ||
            item.status === 'comment_violate'
          "
        >
          <p
            class="text"
            :class="{
              quote_cursor:
                item.status === 'post_review_violate' ||
                item.status === 'post_violate',
            }"
            @click="navigateToPost(item.status, item.postId)"
          >
            原文：{{
              item.status === 'post_review_violate' ||
              item.status === 'post_violate'
                ? item.pContent
                : item.status === 'comment_violate'
                  ? item.cContent
                  : ''
            }}
          </p>
        </div>
      </li>
    </ul>
    <ul v-else>
      <li style="text-align: center">没有消息</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.message {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: $mobile-size) {
    padding-top: 10px;
  }

  ul {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    li {
      width: calc(100% - 20px);
      border-radius: 10px;
      padding: 15px;
      box-shadow: var(--theme-shadow-color);

      @media (max-width: $mobile-size) {
        width: calc(100vw - 30px);
      }

      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;

        .time {
          font-size: 13px;
          color: rgb(198, 201, 206);
        }
      }

      h3 {
        margin-bottom: 5px;
        opacity: 0.8;
      }

      .tip {
        font-size: 15px;
        color: rgb(160, 162, 165);
      }

      .quote {
        margin-top: 10px;
        border-radius: 5px;
        padding: 10px;
        background-color: var(--theme-message-quote-bg-color);

        .text {
          font-size: 15px;
          color: rgb(160, 162, 165);
          display: -webkit-box;
          line-clamp: 1;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          line-height: 1.5;
          overflow: hidden;
        }
      }

      .quote_cursor {
        cursor: pointer;
      }
    }
  }
}

.post_review_pass {
  color: rgb(116, 184, 142);
}

.post_review_violate,
.post_violate,
.comment_violate {
  color: rgb(218, 156, 125);
}

.user_mute,
.user_post_prohibit,
.user_login_prohibit {
  color: rgb(205, 130, 130);
}

.system_announcement {
  color: rgb(126, 154, 213);
}

.post_review_pass,
.post_review_violate,
.user_mute,
.user_post_prohibit,
.user_login_prohibit,
.system_announcement,
.post_violate,
.comment_violate {
  font-weight: bold;
  font-size: 13px;
}
</style>
