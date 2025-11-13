<script setup lang="ts">
import PostList from '../post/components/PostList.vue'

import { getPostDetailAPI, getUserCollectPostAPI, getUserPostAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostInfo } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import router, { RouterPath } from '@/router'
import UserCard from './components/UserCard.vue'
import ToggleBtn from '@/components/button/ToggleBtn.vue'

const userPostMap = ref(new Map<string, PostInfo>())
const userCollectedPostMap = ref(new Map<string, PostInfo>())

const userPostOrder = ref<string[]>([])
const userCollectedPostOrder = ref<string[]>([])

const userPostList = computed(() =>
  userPostOrder.value.map((p_id) => userPostMap.value.get(p_id)!)
)

const userCollectedPost = computed(() =>
  userCollectedPostOrder.value.map(
    (p_id) => userCollectedPostMap.value.get(p_id)!
  )
)

const userStore = useUserStore()
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

  const data: PostInfo[] = res.data.data

  if (data.length < limit) {
    upHasMore.value = false
    console.log('no post load')
  }

  for (const item of data) {
    if (!userPostMap.value.has(item.p_id)) {
      userPostOrder.value.push(item.p_id)
    }
    userPostMap.value.set(item.p_id, item)
  }
}
getUserPostList(userPostListPage.value)

const getUserCollectedPostList = async (page: number) => {
  const res = await getUserCollectPostAPI({
    creatorUserId: userStore.userInfo?.user_id as string,
    page,
    limit,
  })

  const data: PostInfo[] = res.data.data

  if (data.length < limit) {
    ucpHasMore.value = false
    console.log('no post load')
  }

  for (const item of data) {
    if (!userCollectedPostMap.value.has(item.p_id)) {
      userCollectedPostOrder.value.push(item.p_id)
    }
    userCollectedPostMap.value.set(item.p_id, item)
  }
}
getUserCollectedPostList(userCollectedPostListPage.value)

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

const getUserInfo = async () => {
  await userStore.getUserInfo()
}
getUserInfo()

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
