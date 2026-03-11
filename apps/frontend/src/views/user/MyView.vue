<script setup lang="ts">
import PostList from '../post/components/PostList.vue'
import { getPostDetailAPI, getUserCollectPostAPI, getUserPostAPI } from '@/api'
import { computed, onMounted, ref, watch } from 'vue'
import type { PostDetail } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import router, { RouterPath } from '@/router'
import UserCard from './components/UserCard.vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'

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
  const res = await getUserPostAPI({
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
  const res = await getUserCollectPostAPI({
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

onMounted(async () => {
  await getUserInfo()
  getUserPostList(userPostListPage.value)
  getUserCollectedPostList(userCollectedPostListPage.value)
})

watch(
  () => userStore.token,
  async () => {
    if (!userStore.token) return
    await getUserInfo()
    userPostListPage.value = 1
    userCollectedPostListPage.value = 1
    userPostMap.value.clear()
    userCollectedPostMap.value.clear()
    getUserPostList(userPostListPage.value)
    getUserCollectedPostList(userCollectedPostListPage.value)
  }
)

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
    } else if (!toggleStatus.value) {
      userCollectedPostMap.value.set(pId, post)
    }

    if (route.path.startsWith(RouterPath.my)) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  }
)

const route = useRoute()
emitter.on('EVENT:GET_MORE_POST', async () => {
  if (!route.path.startsWith(RouterPath.my)) return
  if (toggleStatus.value) {
    userPostListPage.value++
    showLoading.value = true
    await getUserPostList(userPostListPage.value).catch()
    showLoading.value = false
  } else {
    userCollectedPostListPage.value++
    showLoading.value = true
    await getUserCollectedPostList(userCollectedPostListPage.value).catch()
    showLoading.value = false
  }
})

const toggleStatus = ref(true)
const changeStatus = () => {
  toggleStatus.value = !toggleStatus.value
}
</script>

<template>
  <article class="my-view">
    <header class="left">
      <UserCard :user-info="userStore.userInfo" />
    </header>
    <div class="right">
      <ToggleBtn class="toggle" @click="changeStatus" :status="toggleStatus">
        <template #first>我的</template>
        <template #second>收藏</template>
      </ToggleBtn>
      <div v-if="toggleStatus">
        <PostList
          v-if="userPostList.length > 0"
          :post-list="userPostList"
          :has-more="upHasMore"
          :show-loading
        />
        <div class="tip" v-else>
          没有帖子，去
          <button @click="router.push(RouterPath.publish)">new</button>
          一个
        </div>
      </div>
      <div v-else>
        <PostList
          v-if="userCollectedPost.length > 0"
          :post-list="userCollectedPost"
          :has-more="ucpHasMore"
          :show-loading
        />
        <div class="tip" v-else>
          没有收藏的帖子，去
          <button @click="router.push(RouterPath.base)">收藏</button>
          一个
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.my-view {
  display: flex;
  justify-content: center;
  margin-right: auto;
  gap: $gap;
  width: 100%;

  header {
    width: 400px;
    height: 290px;
    padding: 10px 10px 0;
    gap: initial;
    position: sticky;
    top: 80px;
    z-index: $user-info-card-z-index;
  }

  .right {
    width: 400px;

    .tip {
      text-align: center;
      margin-top: 20px;

      button {
        font-weight: bold;
        font-size: 18px;
        text-decoration: underline;
      }
    }

    .toggle {
      margin-bottom: 10px;
      position: sticky;
      top: 80px;
      z-index: $user-post-toggle-z-index;
    }
  }

  @media (max-width: calc($mobile-size * 2 + 10px)) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    header {
      position: initial;
    }
  }

  @media (max-width: $mobile-size) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    header {
      position: initial;
      width: 100%;
    }

    .right {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;

      .toggle {
        width: calc(100vw - 30px);
        margin-bottom: 0px;
        top: 10px;
        left: 10px;
      }
    }
  }
}
</style>
