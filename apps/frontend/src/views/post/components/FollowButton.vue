<script setup lang="ts">
import { updateUserAddFollowAPI, updateUserDelFollowAPI } from '@/api'
import router, { RouterPath } from '@/router'
import { usePostStore, useUserStore } from '@/stores'
import { checkLoginStatus, Toast } from '@/utils'
import { useRoute } from 'vue-router'

const { isFollow } = defineProps<{
  isFollow: boolean
}>()

function navigateToLogin() {
  router.push(RouterPath.login)
}

const route = useRoute()
const userStore = useUserStore()
const postStore = usePostStore()

let flag = true
const follow = async () => {
  if (!checkLoginStatus(navigateToLogin)) return
  if (!flag) return
  flag = false
  if (isFollow) {
    await updateUserDelFollowAPI({
      followId: route.params.userId as string,
    }).catch()
    Toast.show({
      msg: '已取消关注',
      type: 'success',
    })
  } else {
    await updateUserAddFollowAPI({
      followId: route.params.userId as string,
    }).catch()
    Toast.show({
      msg: '关注成功',
      type: 'success',
    })
  }
  await userStore.getUserFollowList()
  await postStore.getUserInfoWithFans(route.params.userId as string)
  flag = true
}
</script>

<template>
  <button @click="follow">{{ isFollow ? '已关注' : '关注' }}</button>
</template>

<style scoped lang="scss">
button {
  width: 70px;
  height: 32px;
  border-radius: $gap;
  background-color: var(--theme-button-color);
}
</style>
