<script setup lang="ts">
import { getPostListAPI } from '@/api'
import PostCard from './components/PostCard.vue'
import { ref } from 'vue'
import type { PostInfo } from '@forum-monorepo/types'

const postList = ref<PostInfo[]>([])
const getPostList = async () => {
  const res = await getPostListAPI(1, 20)
  postList.value = res.data.data
}
getPostList()
</script>

<template>
  <section>
    <ul>
      <li v-for="post in postList" :key="post.p_id"><PostCard :post /></li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
section {
  ul {
    display: grid;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: $gap;

    li {
      width: 400px;
    }

    @media (max-width: $mobile-size) {
      gap: initial;

      li {
        width: 100%;
        padding: 10px 10px 0;
      }
    }
  }
}
</style>
