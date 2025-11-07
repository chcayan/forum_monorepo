<script setup lang="ts">
import PostList from '../post/components/PostList.vue'

import { getUserPostAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostInfo } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { RouterPath } from '@/router'
import UserCard from './components/UserCard.vue'

const postMap = ref(new Map())

const postList = computed(() => {
  let all: PostInfo[] = []
  for (const [, list] of postMap.value.entries()) {
    all = all.concat(list)
  }
  return all
})

const userStore = useUserStore()
const total = ref(0)
const postListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const getPostList = async (page: number) => {
  if (!hasMore.value) return
  const res = await getUserPostAPI({
    creatorUserId: userStore.userInfo?.user_id as string,
    page,
    limit,
  })
  const data: PostInfo[] = res.data.data
  total.value = res.data.total
  if (data.length < limit) {
    hasMore.value = false
    console.log('no post load')
  }
  const dataWithPage = data.map((item) => ({
    ...item,
    page: postListPage.value,
  }))

  postMap.value.set(page, dataWithPage)
}
getPostList(postListPage.value)

emitter.on('EVENT:UPDATE_USER_POST_LIST', async (page: number) => {
  await getPostList(page)
  if (route.path.startsWith(RouterPath.user)) {
    emitter.emit('EVENT:TOGGLE_FLAG')
  }
})

const route = useRoute()
emitter.on('EVENT:GET_MORE_POST', async () => {
  if (!route.path.startsWith(RouterPath.user)) return
  postListPage.value++
  showLoading.value = true
  await getPostList(postListPage.value)
  showLoading.value = false
})

const getUserInfo = async () => {
  await userStore.getUserInfo()
}
getUserInfo()
</script>

<template>
  <article class="user-view">
    <header class="left">
      <UserCard :user-info="userStore.userInfo" />
    </header>
    <div class="right">
      <PostList :post-list :has-more :show-loading />
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
    gap: initial;
    position: sticky;
    top: 80px;
    z-index: $user-info-card-z-index;
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
    padding: 10px 10px 0;

    header {
      position: initial;
      width: 100%;
    }
  }
}
</style>
