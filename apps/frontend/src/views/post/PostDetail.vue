<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import PostCard from './components/PostCard.vue'
import type { CommentList, PostDetail } from '@forum-monorepo/types'
import { useRoute } from 'vue-router'
import { getCommentListAPI, getPostDetailAPI } from '@/api'
import CommentInput from './components/CommentInput.vue'
import CommentCard from './components/CommentCard.vue'
import emitter from '@/utils/eventEmitter'

const route = useRoute()
const postDetail = ref<PostDetail>({
  isPublic: '',
  pId: '',
  userId: '',
  pViewCount: '',
  pCollectCount: '',
  pShareCount: '',
  pCommentCount: '',
  pContent: '',
  pImages: [],
  publishTime: '',
  status: 1,
  userAvatar: '',
  username: '',
})

const getPostDetail = async () => {
  const postId = route.params.postId as string
  const res = await getPostDetailAPI(postId)
  postDetail.value = res.data.data
}
getPostDetail()

const commentList = ref<CommentList[]>()

const getCommentList = async () => {
  const postId = route.params.postId as string
  const res = await getCommentListAPI(postId)
  commentList.value = res.data.data
}
getCommentList()

const onCommentInput = () => {
  emitter.emit('EVENT:FOCUS_COMMENT_INPUT')
}

let off1 = emitter.on('EVENT:UPDATE_POST_DETAIL', async () => {
  await getPostDetail()
  emitter.emit('EVENT:TOGGLE_FLAG')
})

let off2 = emitter.on('EVENT:UPDATE_COMMENT_LIST', () => {
  getCommentList()
})

onUnmounted(() => {
  off1?.()
  off2?.()
})
</script>

<template>
  <article v-if="postDetail.pId" class="post-detail">
    <header class="left">
      <PostCard :post="postDetail" :is-restrict-line="false" />
    </header>
    <div class="right">
      <div class="main">
        <CommentInput />
      </div>
      <footer>
        <ul
          tabindex="0"
          class="tab-focus-outline-style"
          v-if="commentList?.length"
        >
          <li v-for="comment in commentList" :key="comment.commentId">
            <CommentCard :comment />
          </li>
        </ul>
        <ul v-else>
          <li class="tip">
            what can i
            <button @click="onCommentInput" title="何意味">say</button> !
          </li>
        </ul>
      </footer>
    </div>
  </article>
</template>

<style scoped lang="scss">
.post-detail {
  display: flex;
  justify-content: center;
  margin-right: auto;
  gap: $gap;
  width: 100%;

  header {
    width: 400px;
    gap: initial;
  }

  .right {
    .main {
      width: 400px;
      margin-bottom: 10px;
      position: sticky;
      top: 80px;
    }

    footer {
      position: sticky;
      top: 150px;

      ul {
        width: 400px;
        max-height: calc(100vh - 160px);
        overflow-y: scroll;
        border-radius: 10px;
        box-shadow: var(--theme-shadow-color);

        &::-webkit-scrollbar {
          width: 10px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-color: var(--theme-scrollbar-thumb-color);
        }

        li {
          height: auto;
          padding: $gap;
        }

        .tip {
          text-align: center;

          button {
            color: var(--theme-font-color);
            text-decoration: underline;
            font-weight: bold;
            font-size: 18px;
          }
        }

        @media (max-width: calc($mobile-size * 2 + 10px)) {
          margin-bottom: 70px;
        }

        @media (max-width: $mobile-size) {
          width: 100%;
          height: auto;
          margin-bottom: 70px;
        }
      }
    }
  }

  @media (max-width: calc($mobile-size * 2 + 10px)) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .right {
      display: flex;
      justify-content: center;

      .main {
        width: 400px;
        position: fixed;
        top: initial;
        bottom: $gap;
        margin-bottom: 0;
      }

      footer {
        position: initial;
      }
    }
  }

  @media (max-width: $mobile-size) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 10px 0;

    header {
      width: 100%;
    }

    .right {
      .main {
        width: calc(100% - 2 * $gap);
        position: fixed;
        bottom: 70px;
        left: $gap;
        margin-bottom: 0;
        top: initial;
      }

      footer {
        position: initial;
        width: calc(100vw - $gap * 2);
      }
    }
  }
}
</style>
