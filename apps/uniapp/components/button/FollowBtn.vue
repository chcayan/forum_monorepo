<script setup lang="ts">
import { updateUserAddFollowAPI, updateUserDelFollowAPI } from '@/api'
import { usePostStore, useUserStore } from '@/stores'
import { checkLoginStatus } from '@/utils'
import { useStatusStore } from '@/stores'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const userId = ref('')
onLoad((options) => {
  userId.value = options.userId
})

const statusStore = useStatusStore()

const { isFollow } = defineProps<{
  isFollow: boolean
}>()

const userStore = useUserStore()
const postStore = usePostStore()

let flag = true
const follow = async () => {
  if (!checkLoginStatus()) return
  if (!flag) return
  flag = false
  try {
    console.log(isFollow)
    if (isFollow) {
      await updateUserDelFollowAPI({
        followId: userId.value,
      })
      uni.showToast({
        icon: 'none',
        title: '已取消关注',
      })
    } else {
      await updateUserAddFollowAPI({
        followId: userId.value,
      })
      uni.showToast({
        icon: 'none',
        title: '关注成功',
      })
    }
    await userStore.getUserFollowList()
    await userStore.getUserFriendList()
    await postStore.getUserInfoWithFans(userId.value)
  } catch {
    uni.showToast({
      icon: 'none',
      title: '操作失败',
    })
  } finally {
    flag = true
  }
}
</script>

<template>
  <text
    class="follow-btn"
    @click="follow"
    :class="{ theme: statusStore.isDarkMode }"
    >{{ isFollow ? '已关注' : '关注' }}</text
  >
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-button-color !important;
}

.follow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 32px;
  font-size: 14px;
  border-radius: $gap;
  background-color: $theme-light-button-color;
}
</style>
