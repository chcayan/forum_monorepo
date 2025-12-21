<script setup lang="ts">
import { getUserFansAPI, getUserFollowsAPI } from '@/api'
import { useUserStore } from '@/stores'
import emitter from '@/utils/eventEmitter'
import type { FriendInfo } from '@/types'
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { RouterPath, getImgUrl } from '@/utils'
import { useStatusStore } from '@/stores'

const statusStore = useStatusStore()

const postId = ref('')
onLoad((options) => {
  postId.value = options.postId
})

type UserListType = 'follow' | 'fan' | undefined

const props = defineProps<{
  showUserListWidget: boolean
  isFollowOrFan: UserListType
}>()

const userStore = useUserStore()
const userList = ref<FriendInfo[]>([])

const getUserFollowList = async () => {
  const res = await getUserFollowsAPI(
    postId.value || userStore.userInfo.user_id
  )
  userList.value = res.data.data
}

const getUserFanList = async () => {
  const res = await getUserFansAPI(postId.value || userStore.userInfo.user_id)
  userList.value = res.data.data
}

watch(
  () => props.showUserListWidget,
  async () => {
    if (!props.showUserListWidget) return
    userList.value = []
    if (props.isFollowOrFan === 'follow') {
      getUserFollowList()
    } else if (props.isFollowOrFan === 'fan') {
      await getUserFanList()
    }
  }
)

const navigateToUser = (userId: string) => {
  uni.navigateTo({
    url: `${RouterPath.user}?userId=${userId}`,
  })
}
</script>

<template>
  <view
    v-if="props.showUserListWidget && userList.length"
    class="user-list-widget"
    :class="{ theme: statusStore.isDarkMode }"
  >
    <view
      class="li"
      v-for="user in userList"
      :key="user.follow_id"
      @click="
        navigateToUser(
          props.isFollowOrFan === 'follow' ? user.follow_id : user.user_id
        )
      "
    >
      <image class="img" :src="getImgUrl(user.user_avatar)" mode="aspectFill" />
      <text class="name">{{ user.username }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-avatar-widget-color !important;
}

.user-list-widget {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 150px;
  height: auto;
  max-height: 300px;
  overflow-y: scroll;
  padding: 10px;
  border-radius: 10px;
  background-color: $theme-light-avatar-widget-color;
  box-shadow: $theme-light-shadow-color;

  .li {
    display: flex;
    align-items: center;
    gap: 10px;

    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      font-size: 15px;
    }

    .img {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 50%;
    }
  }
}
</style>
