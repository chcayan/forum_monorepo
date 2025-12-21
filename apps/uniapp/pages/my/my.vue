<script setup lang="ts">
import PostList from '@/components/post/PostList.vue'
import { getPostDetailAPI, getUserCollectPostAPI, getUserPostAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostDetail } from '@/types'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from '@/stores'
import UserCard from '@/components/user/UserCard.vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useStatusStore } from '@/stores'
import { RouterPath, getCurrentRoute } from '@/utils'

const statusStore = useStatusStore()

const userPostMap = ref(new Map<string, PostDetail>())
const userCollectedPostMap = ref(new Map<string, PostDetail>())

const userPostOrder = ref<string[]>([])
const userCollectedPostOrder = ref<string[]>([])
const userStore = useUserStore()

const getUserInfo = async () => {
  await userStore.getUserInfo()
}

const userPostList = computed(() =>
  userPostOrder.value
    .map((p_id) => userPostMap.value.get(p_id)!)
    .filter(Boolean)
)

const userCollectedPost = computed(() =>
  userCollectedPostOrder.value
    .map((p_id) => userCollectedPostMap.value.get(p_id)!)
    .filter(Boolean)
)

const limit = 10
const showLoading = ref(false)

const upHasMore = ref(true)
const userPostListPage = ref(1)

const ucpHasMore = ref(true)
const userCollectedPostListPage = ref(1)

const getUserPostList = async (page: number) => {
  const res = await getUserPostAPI({
    creatorUserId: userStore.userInfo?.user_id as string,
    page,
    limit,
  })

  const data: PostDetail[] = res.data.data

  if (data.length < limit) {
    upHasMore.value = false
  }

  for (const item of data) {
    if (!userPostMap.value.has(item.p_id)) {
      userPostOrder.value.push(item.p_id)
    }
    userPostMap.value.set(item.p_id, item)
  }
}

const getUserCollectedPostList = async (page: number) => {
  const res = await getUserCollectPostAPI({
    creatorUserId: userStore.userInfo?.user_id as string,
    page,
    limit,
  })

  const data: PostDetail[] = res.data.data

  if (data.length < limit) {
    ucpHasMore.value = false
  }

  for (const item of data) {
    if (!userCollectedPostMap.value.has(item.p_id)) {
      userCollectedPostOrder.value.push(item.p_id)
    }
    userCollectedPostMap.value.set(item.p_id, item)
  }
}

onLoad(async () => {
  await getUserInfo()
  getUserPostList(userPostListPage.value)
  getUserCollectedPostList(userCollectedPostListPage.value)
})

emitter.on('EVENT:DELETE_USER_POST_LIST', async (p_id: string) => {
  if (userPostMap.value.get(p_id)) {
    userPostMap.value.delete(p_id)
  }
  if (userCollectedPostMap.value.get(p_id)) {
    userCollectedPostMap.value.delete(p_id)
  }
  await userStore.getUserCollectListOfPostId()
})

emitter.on(
  'EVENT:UPDATE_USER_POST_LIST',
  async (p_id: string, isNewPost: boolean) => {
    const res = await getPostDetailAPI(p_id)
    if (userPostMap.value.get(p_id)) {
      userPostMap.value.set(p_id, res.data.data[0])
    }
    if (isNewPost) {
      userPostMap.value.set(p_id, res.data.data[0])
      userPostOrder.value = [
        p_id,
        ...userPostOrder.value.filter((id) => id !== p_id),
      ]
      return
    }
    if (!userCollectedPostMap.value.get(p_id)) {
      userCollectedPostMap.value.set(p_id, res.data.data[0])
      userCollectedPostOrder.value = [
        p_id,
        ...userCollectedPostOrder.value.filter((id) => id !== p_id),
      ]
    } else {
      userCollectedPostMap.value.set(p_id, res.data.data[0])
    }

    const currentRoute = getCurrentRoute()

    if (currentRoute?.startsWith(RouterPath.my)) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  }
)

const toggleStatus = ref(true)
const changeStatus = () => {
  toggleStatus.value = !toggleStatus.value
}

onReachBottom(async () => {
  if (toggleStatus.value) {
    userPostListPage.value++
    showLoading.value = true
    try {
      await getUserPostList(userPostListPage.value)
    } catch {
    } finally {
      showLoading.value = false
    }
  } else {
    userCollectedPostListPage.value++
    showLoading.value = true
    try {
      await getUserCollectedPostList(userCollectedPostListPage.value)
    } catch {
    } finally {
      showLoading.value = false
    }
  }
})

// #ifdef MP-WEIXIN
import { onShow } from '@dcloudio/uni-app'
import { navigateInterceptor } from '@/utils'

onShow(() => {
  navigateInterceptor()
})
// #endif
</script>

<template>
  <view class="my-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="header">
      <UserCard :user-info="userStore.userInfo" />
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
        <view class="tip" v-else>
          没有帖子，去
          <text class="btn">new</text>
          一个
        </view>
      </view>
      <view v-else>
        <PostList
          v-if="userCollectedPost.length > 0"
          :post-list="userCollectedPost"
          :has-more="ucpHasMore"
          :show-loading="showLoading"
        />
        <view class="tip" v-else>
          没有收藏的帖子，去
          <text class="btn">收藏</text>
          一个
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.my-view {
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

      .btn {
        font-weight: bold;
        font-size: 18px;
        text-decoration: underline;
      }
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
