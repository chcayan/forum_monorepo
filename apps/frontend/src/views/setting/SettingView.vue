<script setup lang="ts">
import ToggleBtn from '@/components/button/ToggleBtn.vue'
import router, { RouterPath } from '@/router'
import { useUserStore } from '@/stores'
import { useStatusStore } from '@/stores/modules/status'
import { Toast } from '@/utils'
import { useRoute } from 'vue-router'

const statusStore = useStatusStore()
const userStore = useUserStore()
const route = useRoute()
const onLogin = () => {
  if (route.query.redirect) return
  if (route.path !== RouterPath.base) {
    router.replace(`${RouterPath.login}?redirect=${route.fullPath}`)
  } else {
    router.push(RouterPath.login)
  }
}

const logout = () => {
  userStore.removeToken()
  if (
    route.path !== RouterPath.base &&
    !route.path.startsWith(RouterPath.post)
  ) {
    router.push(RouterPath.base)
  }
  Toast.show({
    msg: '退出成功',
    type: 'success',
  })
}

const onLogout = () => {
  Toast.show({
    msg: '你真的要离开吗😶‍🌫️',
    type: 'error',
    duration: 5000,
    eventFn: logout,
  })
}
</script>

<template>
  <div class="setting">
    <h2>设置</h2>
    <h3>外观</h3>
    <div class="item">
      <p>主题</p>
      <ToggleBtn
        :status="statusStore.currentTheme === 'Light' ? true : false"
        class="toggle-btn"
        @click="statusStore.toggleTheme"
      >
        <template #first>浅色</template>
        <template #second>深色</template>
      </ToggleBtn>
    </div>
    <h3>个人</h3>
    <div class="item">
      <p>账号状态</p>
      <button
        class="login tab-focus-style"
        @click="onLogout"
        v-if="userStore.token"
      >
        退出登录
      </button>
      <button class="login tab-focus-style" @click="onLogin" v-else>
        登录
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting {
  width: 400px;
  // height: 500px;
  border-radius: 10px;
  padding: 10px;
  box-shadow: var(--theme-shadow-color);

  h3 {
    margin-top: 20px;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .toggle-btn {
      width: 120px;
    }

    p {
      margin: 10px 0;
    }

    .login {
      padding: 0 15px;
      border-radius: $gap;
      height: 35px;
      font-weight: bold;
      background-color: var(--theme-button-color);
      box-shadow: var(--theme-shadow-color);
    }
  }

  @media (max-width: $mobile-size) {
    margin-top: 10px;
    width: calc(100vw - 20px);
  }
}
</style>
