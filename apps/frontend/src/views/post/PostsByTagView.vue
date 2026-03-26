<script setup lang="ts">
import { getPostDetailAPI, getPostsByTagAPI } from '@/api'
import router, { RouterPath } from '@/router'
import emitter from '@/utils/eventEmitter'
import { PostDetail } from '@forum-monorepo/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import PostList from './components/PostList.vue'

const route = useRoute()

const postsByTagMap = ref(new Map<string, PostDetail>())

const page = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const postsByTagList = computed(() => Array.from(postsByTagMap.value.values()))

const getPostsByTagList = async (page: number) => {
  const name = route.query.name as string
  if (!name) return
  const res = await getPostsByTagAPI(name, page, limit)

  const data: PostDetail[] = res.data.data.list

  if (data.length < limit) {
    hasMore.value = false
  }

  for (const item of data) {
    postsByTagMap.value.set(item.pId, item)
  }
}

getPostsByTagList(page.value)

emitter.on('EVENT:UPDATE_POST_LIST', async (pId: string) => {
  try {
    const res = await getPostDetailAPI(pId)

    postsByTagMap.value.set(pId, res.data.data)
    if (route.path === RouterPath.search) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  } catch {
    router.replace(RouterPath.notFound)
  }
})

emitter.on('EVENT:GET_MORE_POST', async () => {
  if (route.path !== RouterPath.base) return
  page.value++
  showLoading.value = true
  await getPostsByTagList(page.value).catch()
  showLoading.value = false
})
</script>

<template>
  <PostList :postList="postsByTagList" :hasMore :showLoading />
</template>

<style scoped lang="scss"></style>
