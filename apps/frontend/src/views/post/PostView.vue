<script setup lang="ts">
import PostList from './components/PostList.vue'
import { getPostDetailAPI, getPostListAPI } from '@/api'
import { computed, ref } from 'vue'
import type { PostDetail } from '@forum-monorepo/types'
import emitter from '@/utils/eventEmitter'
import { useRoute } from 'vue-router'
import router, { RouterPath } from '@/router'
import SearchSvg from '@/components/svgIcon/SearchSvg.vue'
import { Toast } from '@/utils'

const postMap = ref(new Map<string, PostDetail>())
const route = useRoute()

const postListPage = ref(1)
const limit = 10
const hasMore = ref(true)
const showLoading = ref(false)

const postList = computed(() => Array.from(postMap.value.values()))

const getPostList = async (page: number) => {
  const res = await getPostListAPI(page, limit)

  const data: PostDetail[] = res.data.data.list

  if (data.length < limit) {
    hasMore.value = false
  }

  for (const item of data) {
    postMap.value.set(item.pId, item)
  }
}

getPostList(postListPage.value)

emitter.on('EVENT:UPDATE_POST_LIST', async (p_id: string) => {
  try {
    const res = await getPostDetailAPI(p_id)

    postMap.value.set(p_id, res.data.data)
    if (route.path === RouterPath.base) {
      emitter.emit('EVENT:TOGGLE_FLAG')
    }
  } catch {
    router.replace(RouterPath.notFound)
  }
})

emitter.on('EVENT:GET_MORE_POST', async () => {
  if (route.path !== RouterPath.base) return
  postListPage.value++
  showLoading.value = true
  await getPostList(postListPage.value).catch()
  showLoading.value = false
})

const result = ref('')

const search = (result: string) => {
  if (!result) {
    Toast.show({
      msg: '请输入内容',
      type: 'error',
    })
    return
  }
  router.push(`${RouterPath.search}?result=${result}`)
}
</script>

<template>
  <div class="post-box">
    <div class="input-item">
      <label>
        <input
          v-model="result"
          type="text"
          name="post-result"
          placeholder="搜索帖子"
          @keydown.enter="search(result)"
        />
        <SearchSvg class="search" @click="search(result)" />
      </label>
    </div>
    <PostList :postList :hasMore :showLoading />
  </div>
</template>

<style scoped lang="scss">
.post-box {
  width: 100%;
  .input-item {
    position: sticky;
    top: 80px;
    z-index: $user-info-card-z-index;

    @media (max-width: $mobile-size) {
      top: 10px;
    }

    label {
      margin: 0 auto;
      width: 400px;
      display: block;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 10px;
      position: relative;
      box-shadow: var(--theme-shadow-color);
      cursor: pointer;
      transition: all 0.3s ease;

      @media (max-width: $mobile-size) {
        width: calc(100% - 20px);
      }

      input {
        background-color: var(--theme-avatar-widget-color);
        width: 400px;
        height: 40px;
        padding-left: 10px;
        padding-right: 45px;
        color: var(--theme-font-color);

        &::placeholder {
          color: var(--theme-font-color);
          opacity: 0.5;
        }
      }

      .search {
        position: absolute;
        right: 8px;
        top: 4px;
        opacity: 0.5;
      }

      &:has(input:focus) {
        box-shadow: 0 0 7px var(--theme-button-hover-color);
      }
    }
  }
}
</style>
