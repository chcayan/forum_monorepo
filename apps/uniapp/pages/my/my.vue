<script setup lang="ts">
import PostList from '@/components/post/PostList.vue'
import { getPostDetailAPI, getMyCollectPostAPI, getMyPostAPI } from '@/api'
import { computed, onMounted, ref } from 'vue'
import type { PostDetail } from '@/types'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from '@/stores'
import UserCard from '@/components/user/UserCard.vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
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
  userPostOrder.value.map((pId) => userPostMap.value.get(pId)!).filter(Boolean)
)

const userCollectedPost = computed(() =>
  userCollectedPostOrder.value
    .map((pId) => userCollectedPostMap.value.get(pId)!)
    .filter(Boolean)
)

const limit = 10
const showLoading = ref(false)

const upHasMore = ref(true)
const userPostListPage = ref(1)

const ucpHasMore = ref(true)
const userCollectedPostListPage = ref(1)

const getUserPostList = async (page: number) => {
  const res = await getMyPostAPI({
    userId: userStore.userInfo?.userId as string,
    page,
    limit,
  })

  const data: PostDetail[] = res.data.data.list

  if (data.length < limit) {
    upHasMore.value = false
  }

  for (const item of data) {
    if (!userPostMap.value.has(item.pId)) {
      userPostOrder.value.push(item.pId)
    }
    userPostMap.value.set(item.pId, item)
  }
}

const getUserCollectedPostList = async (page: number) => {
  const res = await getMyCollectPostAPI({
    userId: userStore.userInfo?.userId as string,
    page,
    limit,
  })

  const data: PostDetail[] = res.data.data.list

  if (data.length < limit) {
    ucpHasMore.value = false
  }

  for (const item of data) {
    if (!userCollectedPostMap.value.has(item.pId)) {
      userCollectedPostOrder.value.push(item.pId)
    }
    userCollectedPostMap.value.set(item.pId, item)
  }
}

let newUser: string

onLoad(async () => {
  await getUserInfo()
  getUserPostList(userPostListPage.value)
  getUserCollectedPostList(userCollectedPostListPage.value)
  newUser = userStore.token
})

onShow(async () => {
  emitter.emit('EVENT:RESET_PUBLISH_PAGE')
  const route = getCurrentRoute()
  if (route !== RouterPath.my) return
  if (newUser === userStore.token) return
  newUser = userStore.token
  await getUserInfo()
  userPostListPage.value = 1
  userCollectedPostListPage.value = 1
  userPostOrder.value = []
  userCollectedPostOrder.value = []
  userPostMap.value.clear()
  userCollectedPostMap.value.clear()
  getUserPostList(userPostListPage.value)
  getUserCollectedPostList(userCollectedPostListPage.value)
})

emitter.on('EVENT:DELETE_USER_POST_LIST', async (pId: string) => {
  if (userPostMap.value.get(pId)) {
    userPostMap.value.delete(pId)
  }
  if (userCollectedPostMap.value.get(pId)) {
    userCollectedPostMap.value.delete(pId)
  }
  await userStore.getUserCollectListOfPostId()
})

emitter.on(
  'EVENT:UPDATE_USER_POST_LIST',
  async (pId: string, isNewPost: boolean) => {
    const res = await getPostDetailAPI(pId)
    const post = res.data.data
    if (userPostMap.value.get(pId)) {
      userPostMap.value.set(pId, post)
    }
    if (isNewPost) {
      userPostMap.value.set(pId, post)
      userPostOrder.value = [
        pId,
        ...userPostOrder.value.filter((id) => id !== pId),
      ]
      return
    }
    if (!toggleStatus.value && !userCollectedPostMap.value.get(pId)) {
      userCollectedPostMap.value.set(pId, post)
      userCollectedPostOrder.value = [
        pId,
        ...userCollectedPostOrder.value.filter((id) => id !== pId),
      ]
    } else {
      userCollectedPostMap.value.set(pId, post)
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
    margin-bottom: 15px;
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
