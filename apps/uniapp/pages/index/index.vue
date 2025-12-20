<script setup lang="ts">
import type { PostDetail } from '@/types/index'
import { getPostListAPI, getPostDetailAPI } from '@/api/index'
import { computed, ref } from 'vue'
import SearchIcon from '@/components/icon/SearchIcon.vue'
import PostList from '@/components/post/PostList.vue'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import emitter from '@/utils/eventEmitter'
import { RouterPath, getCurrentRoute } from '@/utils'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()
const postMap = ref(new Map<string, PostDetail>())

const postListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const postList = computed(() => Array.from(postMap.value.values()))

const getPostList = async (page: number) => {
  const res = await getPostListAPI(page, limit)

  const data: PostDetail[] = res.data.data
  if (data.length < limit) {
    hasMore.value = false
  }

  for (const item of data) {
    postMap.value.set(item.p_id, item)
  }
}

getPostList(postListPage.value)

emitter.on('EVENT:UPDATE_POST_LIST', async (p_id: string) => {
  try {
    const res = await getPostDetailAPI(p_id)
    postMap.value.set(p_id, res.data.data[0])

    const currentRoute = getCurrentRoute()

    if (currentRoute === RouterPath.index) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  } catch {}
})

const result = ref('')

// const search = (result : string) => {
//   if (!result) {
//     Toast.show({
//       msg: '请输入内容',
//       type: 'error',
//     })
//     return
//   }
//   router.push(`${RouterPath.search}?result=${result}`)
// }

onPullDownRefresh(async () => {
  postMap.value.clear()
  postListPage.value = 1
  await getPostList(postListPage.value)
  uni.stopPullDownRefresh()
})

onReachBottom(async () => {
  postListPage.value++
  showLoading.value = true
  try {
    await getPostList(postListPage.value)
  } catch {
  } finally {
    showLoading.value = false
  }
})
</script>

<template>
  <view class="post-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="search-input">
      <input
        type="text"
        placeholder="搜索帖子"
        class="search"
        :class="{ 'theme-search': statusStore.isDarkMode }"
      />
      <SearchIcon class="icon"></SearchIcon>
    </view>
    <view class="blank"></view>
    <scroll-view style="flex: 1">
      <PostList
        :postList="postList"
        :hasMore="hasMore"
        :showLoading="showLoading"
      ></PostList>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.theme-search {
  background-color: $theme-dark-avatar-widget-color !important;
  box-shadow: $theme-dark-shadow-color !important;
}

.post-view {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: $theme-light-color;
  box-sizing: border-box;

  .blank {
    height: 50px;
  }

  .search-input {
    position: fixed;
    left: 0;
    z-index: $user-info-card-z-index;
    width: 100%;
    padding: 0 10px;
    background-color: transparent;
    box-sizing: border-box;

    .icon {
      position: absolute;
      top: 14px;
      right: 16px;
    }

    .search {
      width: 100%;
      height: 40px;
      padding: 0 10px;
      border-radius: 10px;
      margin: 10px 0;
      background-color: $theme-light-avatar-widget-color;
      box-shadow: $theme-light-shadow-color;
      box-sizing: border-box;
    }

    .search::placeholder {
      color: black;
    }
  }
}
</style>
