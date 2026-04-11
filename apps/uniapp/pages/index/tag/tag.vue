<script setup lang="ts">
import { getPostDetailAPI, getPostsByTagAPI, searchPostAPI } from '@/api'
import emitter from '@/utils/eventEmitter'
import { PostDetail } from '@/types'
import { computed, ref } from 'vue'
import PostList from '@/components/post/PostList.vue'
import { onReachBottom, onLoad } from '@dcloudio/uni-app'
import { useStatusStore } from '@/stores'
import { RouterPath, getCurrentRoute } from '@/utils'

const statusStore = useStatusStore()

const searchPostMap = ref(new Map<string, PostDetail>())

const tagPostListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const result = ref('')
onLoad((options) => {
  result.value = options.tag
  console.log(result.value)
  getTagPostList(tagPostListPage.value)
})

const tagPostList = computed(() => Array.from(searchPostMap.value.values()))

const getTagPostList = async (page: number) => {
  if (!result.value) return
  const res = await getPostsByTagAPI(result.value, page, limit)

  const data: PostDetail[] = res.data.data.list

  if (data.length < limit) {
    hasMore.value = false
  }

  for (const item of data) {
    searchPostMap.value.set(item.pId, item)
  }
}

emitter.on('EVENT:UPDATE_POST_LIST', async (pId: string) => {
  try {
    const res = await getPostDetailAPI(pId)
    searchPostMap.value.set(pId, res.data.data)

    const currentRoute = getCurrentRoute()
    if (currentRoute === RouterPath.search) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  } catch {}
})

onReachBottom(async () => {
  tagPostListPage.value++
  showLoading.value = true
  try {
    await getTagPostList(tagPostListPage.value)
  } catch {
  } finally {
    showLoading.value = false
  }
})
</script>

<template>
  <view class="tag-view" :class="{ theme: statusStore.isDarkMode }">
    <PostList
      :postList="tagPostList"
      :hasMore="hasMore"
      :showLoading="showLoading"
    />
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.tag-view {
  min-height: calc(100vh - var(--window-top));
  overflow-y: scroll;
}
</style>
