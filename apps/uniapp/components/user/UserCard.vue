<script setup lang="ts">
import {
  updateUserAddFollowAPI,
  updateUserDelFollowAPI,
  updateUserInfoAPI,
} from '@/api'
import EditIcon from '@/components/icon/EditIcon.vue'
import type { UserInfo } from '@/types'
import UserListWidget from '@/components/user/UserListWidget.vue'
import { getCurrentRoute, getImgUrl, RouterPath } from '@/utils'
import { computed, ref } from 'vue'
import { onHide, onLoad } from '@dcloudio/uni-app'
import { useStatusStore, usePostStore, useUserStore } from '@/stores'
import { checkLoginStatus } from '@/utils'

const statusStore = useStatusStore()
const postStore = usePostStore()
const userStore = useUserStore()

const { userInfo } = defineProps<{
  userInfo: UserInfo
}>()

const edit = () => {
  uni.navigateTo({
    url: RouterPath.edit,
  })
}
// console.log(props.userInfo.username);

const showFollowList = ref(false)
const showFanList = ref(false)

type UserListType = 'follow' | 'fan' | undefined
const isFollowOrFan = ref<UserListType>()

const onShowFollowList = () => {
  console.log(666)
  showFollowList.value = !showFollowList.value
  showFanList.value = false
  isFollowOrFan.value = 'follow'
}

const onShowFanList = () => {
  showFanList.value = !showFanList.value
  showFollowList.value = false
  isFollowOrFan.value = 'fan'
}

onHide(() => {
  showFanList.value = false
  showFollowList.value = false
})

function preview(url: string) {
  uni.previewImage({
    urls: [url],
  })
}

const route = getCurrentRoute()

const userId = ref('')
onLoad((options) => {
  userId.value = options.userId
})

const isFollow = computed(() => {
  return userStore.userFollowIdList.includes(userId.value)
})

let flag = true
const follow = async () => {
  if (!checkLoginStatus()) return
  if (!flag) return
  flag = false
  try {
    if (isFollow.value) {
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
  <view class="user-card">
    <view class="header">
      <image
        class="bg"
        @click="preview(getImgUrl(userInfo.background_img))"
        :src="getImgUrl(userInfo.background_img)"
        mode="aspectFill"
      />
      <image
        class="avatar"
        @click="preview(getImgUrl(userInfo.user_avatar))"
        :src="getImgUrl(userInfo.user_avatar)"
        mode="aspectFill"
      />
      <view
        v-if="
          userInfo.user_id === userStore.userInfo?.user_id &&
          route?.startsWith(RouterPath.my)
        "
        class="btn"
      >
        <EditIcon @click="edit" />
      </view>
      <view class="follow-btn" v-else>
        <text
          v-if="userInfo.user_id !== userStore.userInfo?.user_id"
          class="btn"
          @click="follow"
          :class="{ 'theme-follow-btn': statusStore.isDarkMode }"
          >{{ isFollow ? '已关注' : '关注' }}</text
        >
      </view>
    </view>
    <view class="main">
      <text class="name">{{ userInfo.username }}</text>
      <text class="id">{{ userInfo.user_id }}</text>
      <view class="main-item">
        <view class="follows" @click="onShowFollowList">
          <text class="text">{{ userInfo.follows }} 关注</text>
          <UserListWidget
            class="follow-list"
            :show-user-list-widget="showFollowList"
            :is-follow-or-fan="isFollowOrFan"
          />
        </view>
        <text>&nbsp;&nbsp;&nbsp;</text>
        <view class="fans" @click="onShowFanList">
          <text class="text">{{ userInfo.fans }} 粉丝</text>
          <UserListWidget
            class="fan-list"
            :show-user-list-widget="showFanList"
            :is-follow-or-fan="isFollowOrFan"
          />
        </view>
      </view>
      <view class="desc">{{ userInfo.signature }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
$main-gap: 20px;
$position-size: 200px;

.theme-follow-btn {
  background-color: $theme-dark-button-color !important;
  color: black !important;
}

.user-card {
  display: flex;
  flex-direction: column;
  width: 100%;

  .header {
    position: relative;
    height: $position-size;

    .follow-btn {
      display: flex;

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 70px;
        height: 32px;
        font-size: 14px;
        border-radius: $gap;
        background-color: $theme-light-button-color;
      }

      .f-btn {
        margin-left: auto;
        margin-top: 10px;
      }
    }

    .bg {
      width: 100%;
      height: $position-size - 60px;
      object-fit: cover;
      border-radius: calc($main-gap / 2);
      border: 3px solid black;
      box-sizing: border-box;
    }

    .avatar {
      position: absolute;
      top: $position-size - 100px;
      left: $main-gap;
      width: 80px;
      height: 80px;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 50%;
      border: 3px solid black;
      box-sizing: border-box;
    }

    .btn {
      position: absolute;
      top: $position-size - 50px;
      right: 10px;
      width: 80px;
      height: 30px;
      display: flex;
      justify-content: end;
    }
  }

  .main {
    margin-left: $main-gap;

    .main-item {
      display: flex;
      margin-top: 2px;

      .follows {
        position: relative;

        .follow-list {
          position: absolute;
          z-index: $user-list-widget-z-index;
        }
      }

      .fans {
        position: relative;

        .fan-list {
          position: absolute;
          z-index: $user-list-widget-z-index;
        }
      }

      .text {
        opacity: 0.6;
        font-size: 15px;
      }
    }

    .desc {
      display: -webkit-box;
      line-clamp: 1;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 5px;
      font-size: 15px;
      opacity: 0.8;
    }

    .name {
      font-weight: bold;
      font-size: 20px;
      padding-right: 10px;
    }

    .id {
      opacity: 0.6;
      font-size: 14px;
    }
  }
}
</style>
