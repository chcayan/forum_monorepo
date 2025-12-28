<script setup lang="ts">
import PostList from '@/components/post/PostList.vue'
import { getPostDetailAPI, getUserCollectPostAPI, getUserPostAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostDetail } from '@/types'
import emitter from '@/utils/eventEmitter'
import { usePostStore } from '@/stores'
import UserCard from '@/components/user/UserCard.vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'
import { onLoad, onReachBottom, onShow, onHide } from '@dcloudio/uni-app'
import { useStatusStore } from '@/stores'
import { RouterPath, getCurrentRoute } from '@/utils'

const statusStore = useStatusStore()

const userPostMap = ref(new Map<string, PostDetail>())
const userCollectedPostMap = ref(new Map<string, PostDetail>())

const userPostList = computed(() => Array.from(userPostMap.value.values()))

const userCollectedPost = computed(() =>
  Array.from(userCollectedPostMap.value.values())
)

const limit = 10
const showLoading = ref(false)

const upHasMore = ref(true)
const userPostListPage = ref(1)

const ucpHasMore = ref(true)
const userCollectedPostListPage = ref(1)

const getUserPostList = async (page: number, userId: string) => {
  const res = await getUserPostAPI({
    creatorUserId: userId || id.value,
    page,
    limit,
  })

  const data: PostDetail[] = res.data.data

  if (data.length < limit) {
    upHasMore.value = false
  }

  for (const item of data) {
    userPostMap.value.set(item.p_id, item)
  }
}

const getUserCollectedPostList = async (page: number, userId: string) => {
  const res = await getUserCollectPostAPI({
    creatorUserId: userId || id.value,
    page,
    limit,
  })

  const data: PostDetail[] = res.data.data

  if (data.length < limit) {
    ucpHasMore.value = false
  }

  for (const item of data) {
    userCollectedPostMap.value.set(item.p_id, item)
  }
}

emitter.on('EVENT:UPDATE_USER_POST_LIST', async (p_id: string) => {
  const res = await getPostDetailAPI(p_id)
  userPostMap.value.set(p_id, res.data.data[0])
  if (userCollectedPostMap.value.get(p_id)) {
    userCollectedPostMap.value.set(p_id, res.data.data[0])
  }

  const route = getCurrentRoute()
  if (route === RouterPath.user) {
    emitter.emit('EVENT:TOGGLE_FLAG')
  }
})

onReachBottom(async () => {
  if (toggleStatus.value) {
    userPostListPage.value++
    showLoading.value = true
    try {
      await getUserPostList(userPostListPage.value, id.value)
    } catch {
    } finally {
      showLoading.value = false
    }
  } else {
    userCollectedPostListPage.value++
    showLoading.value = true
    try {
      await getUserCollectedPostList(userCollectedPostListPage.value, id.value)
    } catch {
    } finally {
      showLoading.value = false
    }
  }
})

const postStore = usePostStore()
const getUserInfo = async (userId: string) => {
  await postStore.getUserInfo(userId || id.value).catch(() => {
    uni.redirectTo({
      url: RouterPath.notFound,
    })
  })
}

const toggleStatus = ref(true)
const changeStatus = () => {
  toggleStatus.value = !toggleStatus.value
}

function init(userId: string) {
  getUserInfo(userId)
  getUserPostList(userPostListPage.value, userId).catch(() => {
    uni.redirectTo({
      url: RouterPath.notFound,
    })
  })
  getUserCollectedPostList(userCollectedPostListPage.value, userId).catch(
    () => {
      uni.redirectTo({
        url: RouterPath.notFound,
      })
    }
  )
}

const id = ref('')
onLoad((options) => {
  id.value = options.userId
})

onShow(() => {
  if (id.value) {
    init(id.value)
  }
})
</script>

<template>
  <view class="user-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="header">
      <UserCard :user-info="postStore.userInfo" />
    </view>
    <view class="main">
      <ToggleBtn class="toggle" @click="changeStatus" :status="toggleStatus">
        <template #first>我的</template>
        <template #second>收藏</template>
      </ToggleBtn>
      <view v-if="toggleStatus">
        <PostList
          v-if="userPostList.length > 0"
          :post-list="userPostList"
          :has-more="upHasMore"
          :show-loading="showLoading"
        />
        <view class="tip" v-else>该用户未发布帖子</view>
      </view>
      <view v-else>
        <PostList
          v-if="userCollectedPost.length > 0"
          :post-list="userCollectedPost"
          :has-more="ucpHasMore"
          :show-loading="showLoading"
        />
        <view class="tip" v-else>该用户未收藏帖子</view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.user-view {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: $theme-light-color;
  box-sizing: border-box;

  .header {
    margin-bottom: 10px;
    padding: 10px 10px 0;
  }

  .main {
    .tip {
      text-align: center;
      margin-top: 20px;
      font-size: 16px;
    }

    .toggle {
      margin-left: 10px;
      width: calc(100% - 20px);
      margin-bottom: 10px;
      position: sticky;
      top: calc(var(--window-top) + 10px);
      z-index: $user-post-toggle-z-index;
    }
  }
}
</style>
