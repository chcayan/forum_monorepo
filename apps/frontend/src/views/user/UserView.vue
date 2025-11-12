<script setup lang="ts">
import PostList from '../post/components/PostList.vue'
import { getPostDetailAPI, getUserCollectPostAPI, getUserPostAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostInfo } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'
import { usePostStore } from '@/stores'
import { useRoute } from 'vue-router'
import router, { RouterPath } from '@/router'
import UserCard from './components/UserCard.vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'

const route = useRoute()

const userPostMap = ref(new Map<string, PostInfo>())
const userCollectedPostMap = ref(new Map<string, PostInfo>())

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
    creatorUserId: userId || (route.params?.userId as string),
    page,
    limit,
  })

  const data: PostInfo[] = res.data.data

  if (data.length < limit) {
    upHasMore.value = false
    console.log('no post load')
  }

  for (const item of data) {
    userPostMap.value.set(item.p_id, item)
  }
}

const getUserCollectedPostList = async (page: number, userId: string) => {
  const res = await getUserCollectPostAPI({
    creatorUserId: userId || (route.params?.userId as string),
    page,
    limit,
  })

  const data: PostInfo[] = res.data.data

  if (data.length < limit) {
    ucpHasMore.value = false
    console.log('no post load')
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

  if (route.path.startsWith(RouterPath.user)) {
    emitter.emit('EVENT:TOGGLE_FLAG')
  }
})

emitter.on('EVENT:GET_MORE_POST', async () => {
  if (!route.path.startsWith(RouterPath.user)) return
  if (toggleStatus.value) {
    userPostListPage.value++
    showLoading.value = true
    await getUserPostList(
      userPostListPage.value,
      route.params?.userId as string
    ).catch()
    showLoading.value = false
  } else {
    userCollectedPostListPage.value++
    showLoading.value = true
    await getUserCollectedPostList(
      userCollectedPostListPage.value,
      route.params?.userId as string
    ).catch()
    showLoading.value = false
  }
})

const postStore = usePostStore()
const getUserInfo = async (userId: string) => {
  await postStore
    .getUserInfo(userId || (route.params?.userId as string))
    .catch(() => {
      router.replace(RouterPath.notFound)
    })
}

const toggleStatus = ref(true)
const changeStatus = () => {
  toggleStatus.value = !toggleStatus.value
}

function init(userId: string) {
  getUserInfo(userId)
  getUserPostList(userPostListPage.value, userId).catch(() => {
    router.replace(RouterPath.notFound)
  })
  getUserCollectedPostList(userCollectedPostListPage.value, userId).catch(
    () => {
      router.replace(RouterPath.notFound)
    }
  )
}
init(route.params?.userId as string)

emitter.on('EVENT:REACTIVE_USER_VIEW', (userId: string) => {
  userPostMap.value.clear()
  userCollectedPostMap.value.clear()
  userPostListPage.value = 1
  userCollectedPostListPage.value = 1
  toggleStatus.value = true
  init(userId)
})
</script>

<template>
  <article class="user-view">
    <header class="left">
      <UserCard :user-info="postStore.userInfo" />
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
        <div class="tip" v-else>该用户未发布帖子</div>
      </div>
      <div v-else>
        <PostList
          v-if="userCollectedPost.length > 0"
          :post-list="userCollectedPost"
          :has-more="ucpHasMore"
          :show-loading
        />
        <div class="tip" v-else>该用户未收藏帖子</div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.user-view {
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
      .toggle {
        width: calc(100% - 20px);
        margin-left: 10px;
        margin-bottom: 0px;
        top: 10px;
      }
    }
  }
}
</style>
