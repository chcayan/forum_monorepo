<script setup lang="ts">
import PostList from './components/PostList.vue'
import { getPostListAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostInfo } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'
import { useRoute } from 'vue-router'
import { RouterPath } from '@/router'

// const postList = ref<PostInfo[]>([])
const postMap = ref(new Map())
const route = useRoute()

const postList = computed(() => {
  let all: PostInfo[] = []
  for (const [, list] of postMap.value.entries()) {
    all = all.concat(list)
  }
  return all
})

const total = ref(0)
const postListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const getPostList = async (page: number) => {
  if (!hasMore.value) return
  const res = await getPostListAPI(page, limit)
  if (!res) return
  const data: PostInfo[] = res.data.data
  total.value = res.data.total
  if (data.length < limit) {
    hasMore.value = false
    console.log('no post load')
  }
  const dataWithPage = data.map((item) => ({
    ...item,
    page: postListPage.value,
  }))

  postMap.value.set(page, dataWithPage)
}
getPostList(postListPage.value)

emitter.on('EVENT:UPDATE_POST_LIST', async (page: number) => {
  await getPostList(page)
  if (route.path === RouterPath.base) {
    emitter.emit('EVENT:TOGGLE_FLAG')
  }
})

emitter.on('EVENT:GET_MORE_POST', async () => {
  if (route.path !== RouterPath.base) return
  postListPage.value++
  showLoading.value = true
  await getPostList(postListPage.value)
  showLoading.value = false
})
</script>

<template>
  <PostList :postList :hasMore :showLoading />
</template>

<style scoped lang="scss"></style>
