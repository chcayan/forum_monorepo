<script setup lang="ts">
import PostList from './components/PostList.vue'
import { getPostDetailAPI, getPostListAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostInfo } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'
import { useRoute } from 'vue-router'
import { RouterPath } from '@/router'

const postMap = ref(new Map<string, PostInfo>())
const route = useRoute()

const postListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const postList = computed(() => Array.from(postMap.value.values()))

const getPostList = async (page: number) => {
  const res = await getPostListAPI(page, limit)

  const data: PostInfo[] = res.data.data

  if (data.length < limit) {
    hasMore.value = false
    console.log('no more posts')
  }

  for (const item of data) {
    postMap.value.set(item.p_id, item)
  }
}

getPostList(postListPage.value)

emitter.on('EVENT:UPDATE_POST_LIST', async (p_id: string) => {
  const res = await getPostDetailAPI(p_id)
  postMap.value.set(p_id, res.data.data[0])
  if (route.path === RouterPath.base) {
    emitter.emit('EVENT:TOGGLE_FLAG')
  }
})

emitter.on('EVENT:GET_MORE_POST', async () => {
  if (route.path !== RouterPath.base) return
  postListPage.value++
  showLoading.value = true
  await getPostList(postListPage.value).catch()
  showLoading.value = false
})
</script>

<template>
  <PostList :postList :hasMore :showLoading />
</template>

<style scoped lang="scss"></style>
