<script setup lang="ts">
import { getPostListAPI } from '@/api'
import PostCard from './components/PostCard.vue'
import { ref } from 'vue'
import type { PostInfo } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'

const postList = ref<PostInfo[]>([])
const getPostList = async () => {
  const res = await getPostListAPI(1, 20)
  postList.value = res.data.data
  console.log(postList.value)
}
getPostList()

emitter.on('EVENT:UPDATE_POST_LIST', () => {
  getPostList()
})
</script>

<template>
  <section class="post-view">
    <ul class="post-list">
      <li class="post-item" v-for="post in postList" :key="post.p_id">
        <PostCard :post :is-restrict-line="true" />
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.post-view {
  .post-list {
    display: grid;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: $gap;

    .post-item {
      width: 400px;
    }

    @media (max-width: $mobile-size) {
      gap: initial;

      .post-item {
        width: 100%;
        padding: 10px 10px 0;
      }
    }
  }
}
</style>
