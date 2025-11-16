<script setup lang="ts">
import { getPostDetailAPI, searchPostAPI } from '@/api'
import router, { RouterPath } from '@/router'
import emitter from '@/utils/eventEmitter'
import { PostDetail } from '@forum-monorepo/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import PostList from './components/PostList.vue'

const route = useRoute()

const searchPostMap = ref(new Map<string, PostDetail>())

const searchPostListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const searchPostList = computed(() => Array.from(searchPostMap.value.values()))

const getSearchPostList = async (page: number) => {
  const result = route.query.result as string
  if (!result) return
  const res = await searchPostAPI(result, page, limit)

  const data: PostDetail[] = res.data.data

  if (data.length < limit) {
    hasMore.value = false
  }

  for (const item of data) {
    searchPostMap.value.set(item.p_id, item)
  }
}

getSearchPostList(searchPostListPage.value)

emitter.on('EVENT:UPDATE_POST_LIST', async (p_id: string) => {
  try {
    const res = await getPostDetailAPI(p_id)

    searchPostMap.value.set(p_id, res.data.data[0])
    if (route.path === RouterPath.search) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  } catch {
    router.replace(RouterPath.notFound)
  }
})

emitter.on('EVENT:GET_MORE_POST', async () => {
  if (route.path !== RouterPath.base) return
  searchPostListPage.value++
  showLoading.value = true
  await getSearchPostList(searchPostListPage.value).catch()
  showLoading.value = false
})
</script>

<template>
  <PostList :postList="searchPostList" :hasMore :showLoading />
</template>

<style scoped lang="scss"></style>
