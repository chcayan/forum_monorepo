<script setup lang="ts">
import { getPostDetailAPI, searchPostAPI } from '@/api'
import emitter from '@/utils/eventEmitter'
import { PostDetail } from '@/types'
import { computed, ref } from 'vue'
import PostList from '@/components/post/PostList.vue'
import { onReachBottom, onLoad } from '@dcloudio/uni-app'
import { useStatusStore } from '@/stores'
import { RouterPath, getCurrentRoute } from '@/utils'

const statusStore = useStatusStore()

const searchPostMap = ref(new Map<string, PostDetail>())

const searchPostListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const result = ref('')
onLoad((options) => {
  result.value = options.result
  getSearchPostList(searchPostListPage.value)
})

const searchPostList = computed(() => Array.from(searchPostMap.value.values()))

const getSearchPostList = async (page: number) => {
  if (!result.value) return
  const res = await searchPostAPI(result.value, page, limit)

  const data: PostDetail[] = res.data.data

  if (data.length < limit) {
    hasMore.value = false
  }

  for (const item of data) {
    searchPostMap.value.set(item.p_id, item)
  }
}

emitter.on('EVENT:UPDATE_POST_LIST', async (p_id: string) => {
  try {
    const res = await getPostDetailAPI(p_id)
    searchPostMap.value.set(p_id, res.data.data[0])

    const currentRoute = getCurrentRoute()
    if (currentRoute === RouterPath.search) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  } catch {}
})

onReachBottom(async () => {
  searchPostListPage.value++
  showLoading.value = true
  try {
    await getSearchPostList(searchPostListPage.value)
  } catch {
  } finally {
    showLoading.value = false
  }
})
</script>

<template>
  <view class="search-view" :class="{ theme: statusStore.isDarkMode }">
    <PostList
      :postList="searchPostList"
      :hasMore="hasMore"
      :showLoading="showLoading"
    />
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.search-view {
  min-height: calc(100vh - var(--window-top));
  overflow-y: scroll;
}
</style>
