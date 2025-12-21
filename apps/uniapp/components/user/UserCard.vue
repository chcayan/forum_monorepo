<script setup lang="ts">
import { updateUserInfoAPI } from '@/api'
import EditIcon from '@/components/icon/EditIcon.vue'
import { useUserStore } from '@/stores'
// import FollowButton from '@/views/post/components/FollowButton.vue'
import type { UserInfo } from '@/types'
import UserListWidget from '@/components/user/UserListWidget.vue'
import { getImgUrl, RouterPath } from '@/utils'
import { ref } from 'vue'
import { onHide } from '@dcloudio/uni-app'

const { userInfo } = defineProps<{
  userInfo: UserInfo
}>()

const userStore = useUserStore()

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
      <view v-if="userInfo.user_id === userStore.userInfo?.user_id" class="btn">
        <EditIcon @click="edit" />
      </view>
      <view class="follow-btn" v-else>
        <!-- <FollowButton class="f-btn" :isFollow="userStore.userFollowIdList.includes(userInfo.user_id)" /> -->
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

.user-card {
  display: flex;
  flex-direction: column;
  width: 100%;

  .header {
    position: relative;
    height: $position-size;

    .follow-btn {
      display: flex;

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
      margin-top: 3px;

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
