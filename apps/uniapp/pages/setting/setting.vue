<script setup lang="ts">
import { RouterPath } from '../../utils'
import { useStatusStore, useUserStore } from '@/stores'

const userStore = useUserStore()
const statusStore = useStatusStore()

const onLogin = () => {
  uni.navigateTo({
    url: RouterPath.login,
  })
}

const logout = () => {
  userStore.removeToken()
  uni.showToast({
    icon: 'none',
    title: '退出成功',
  })
}

const onLogout = () => {
  uni.showModal({
    content: '你真的要离开吗😶‍🌫️',
    confirmColor: '#ff0000',
    success(res) {
      if (res.confirm) {
        logout()
      }
    },
  })
}
</script>

<template>
  <view class="setting-view" :class="{ theme: statusStore.isDarkMode }">
    <text class="h3">个人</text>
    <view class="item">
      <text class="p">账号状态</text>
      <view
        class="login"
        :class="{ 'theme-login': statusStore.isDarkMode }"
        @click="onLogout"
        v-if="userStore.token"
      >
        退出登录
      </view>
      <view
        class="login"
        :class="{ 'theme-login': statusStore.isDarkMode }"
        @click="onLogin"
        v-else
      >
        登录
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.theme-login {
  color: black;
  background-color: $theme-dark-button-color !important;
  box-shadow: $theme-dark-shadow-color !important;
}

.setting-view {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom) - 20px);
  background-color: $theme-light-color;
  padding: 10px;

  .h3 {
    font-size: 20px;
    font-weight: bold;
    margin-top: 10px;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .toggle-btn {
      width: 120px;
    }

    .p {
      margin: 20px 0;
    }

    .login {
      margin: 0;
      font-size: 14px;
      padding: 0 15px;
      line-height: 35px;
      border-radius: $gap;
      height: 35px;
      font-weight: bold;
      background-color: $theme-light-button-color;
      box-shadow: $theme-light-shadow-color;
    }
  }
}
</style>
