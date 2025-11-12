<script setup lang="ts">
import { getUserFansAPI, getUserFollowsAPI } from '@/api'
import router, { RouterPath } from '@/router'
import { useUserStore } from '@/stores'
import emitter from '@/utils/eventEmitter'
import { FriendInfo } from '@forum-monorepo/types'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

type UserListType = 'follow' | 'fan' | undefined

const { showUserListWidget, isFollowOrFan } = defineProps<{
  showUserListWidget: boolean
  isFollowOrFan: UserListType
}>()

const userStore = useUserStore()
const userList = ref<FriendInfo[]>([])

const route = useRoute()
const getUserFollowList = async () => {
  const res = await getUserFollowsAPI(
    (route.params?.userId as string) || userStore.userInfo.user_id
  )
  userList.value = res.data.data
  console.log(res.data.data)
}
// getUserList()

const getUserFanList = async () => {
  const res = await getUserFansAPI(
    (route.params?.userId as string) || userStore.userInfo.user_id
  )
  userList.value = res.data.data
}

watch(
  () => showUserListWidget,
  async () => {
    if (!showUserListWidget) return
    userList.value = []
    if (isFollowOrFan === 'follow') {
      getUserFollowList()
    } else if (isFollowOrFan === 'fan') {
      await getUserFanList()
      console.log(userList.value)
    }
  }
)

const navigateToUser = (userId: string) => {
  console.log(userId)
  if (userId === userStore.userInfo.user_id) {
    router.push(RouterPath.my)
    return
  }
  emitter.emit('EVENT:REACTIVE_USER_VIEW', userId)
  router.push(`${RouterPath.user}/${userId}`)
}
</script>

<template>
  <ul v-if="showUserListWidget && userList.length" class="user-list-widget">
    <li
      v-for="user in userList"
      :key="user.follow_id"
      @click="
        navigateToUser(
          isFollowOrFan === 'follow' ? user.follow_id : user.user_id
        )
      "
    >
      <img :src="user.user_avatar" alt="avatar" />
      <div>{{ user.username }}</div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.user-list-widget {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 200px;
  height: auto;
  padding: 10px;
  border-radius: 10px;
  background-color: var(--theme-avatar-widget-color);
  box-shadow: 0 0 2px var(--theme-shadow-color);

  li {
    display: flex;
    align-items: center;
    gap: 10px;

    div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }

    img {
      width: 40px;
      height: 40px;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 50%;
    }
  }
}
</style>
