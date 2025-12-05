<script setup lang="ts">
import type { PostDetail } from '@/types/index'
import PostCard from '@/components/post/PostCard.vue'
import LoadingIcon from '@/components/icon/LoadingIcon.vue'

const props = defineProps<{
  postList: PostDetail[]
  showLoading: boolean
  hasMore: boolean
}>()
</script>

<template>
  <view v-for="post in props.postList" :key="post?.p_id" class="post">
    <PostCard :post="post" :is-restrict-line="true"></PostCard>
  </view>
  <view v-if="showLoading && hasMore" class="loading">
    <LoadingIcon />
  </view>
</template>

<style scoped lang="scss">
.post {
  margin: 10px;
  border-radius: 10px;
  box-shadow: $theme-light-shadow-color;
  box-sizing: border-box;
}
</style>
