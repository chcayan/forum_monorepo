<script setup lang="ts">
import type { PostDetail } from '@forum-monorepo/types'
import PostCard from './PostCard.vue'
import LoadingSvg from '@/components/svgIcon/LoadingSvg.vue'

const { postList } = defineProps<{
  postList: PostDetail[]
  showLoading: boolean
  hasMore: boolean
}>()
</script>

<template>
  <section class="post-view">
    <ul class="post-list">
      <li class="post-item" v-for="post in postList" :key="post?.pId">
        <PostCard :post :is-restrict-line="true" />
      </li>
      <li v-if="showLoading && hasMore" class="loading">
        <LoadingSvg />
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

    .loading {
      display: flex;
      justify-content: center;
      width: 100%;
      height: 80px;
      margin: 10px 0;

      .icon {
        width: 64px;
        height: 64px;
      }
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
