<script setup lang="ts">
import { loginAPI } from '@/api'
import LogoIcon from '@/components/icon/LogoIcon.vue'
import { useUserStore, useStatusStore } from '@/stores'
import { debounce, isValidEmail, isValidPassword } from '@/utils'
import { ref } from 'vue'

const statusStore = useStatusStore()

const userStore = useUserStore()

// 验证邮箱
const email = ref('')
const isEmailValid = ref(true)
const verifyEmail = debounce(() => {
  if (!email.value) {
    isEmailValid.value = true
    return
  }

  isEmailValid.value = isValidEmail(email.value) ? true : false
}, 300)

// 验证密码
const password = ref('')
const isPasswordValid = ref(true)
const verifyPassword = debounce(() => {
  if (!password.value) {
    isPasswordValid.value = true
    return
  }

  isPasswordValid.value = isValidPassword(password.value) ? true : false
}, 300)

// 提交
const submitForm = async () => {
  if (isValidEmail(email.value) && isValidPassword(password.value)) {
    const res = await loginAPI({
      email: email.value,
      password: password.value,
    })
    userStore.setToken(res.data.token)
    Toast.show({
      msg: '登录成功',
      type: 'success',
    })

    const redirect = (route.query.redirect || RouterPath.base) as string
    router.replace(redirect)
  }
}
</script>

<template>
  <view class="login-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="login-header">
      <LogoIcon class="logo" />
      <text class="h1">Welcome back!</text>
      <text class="p">Please enter you details</text>
    </view>
    <view class="login-main">
      <label class="input-box">
        <view class="input-item">
          Email
          <text class="error-tip" v-if="!isEmailValid"> - 邮箱格式不正确</text>
        </view>
        <input
          ref="email-input"
          class="login-input"
          :class="{
            error: !isEmailValid,
            'theme-login-input': statusStore.isDarkMode,
          }"
          v-model="email"
          @input="verifyEmail"
          type="text"
          placeholder="请输入邮箱"
        />
      </label>
      <view class="blank"></view>
      <label class="input-box">
        <view class="input-item">
          Password
          <text class="error-tip" v-if="!isPasswordValid">
            - 只允许数字/字母/符号,长度6-16</text
          >
        </view>
        <input
          class="login-input"
          :class="{
            error: !isPasswordValid,
            'theme-login-input': statusStore.isDarkMode,
          }"
          v-model="password"
          @input="verifyPassword"
          type="safe-password"
          placeholder="请输入密码"
        />
      </label>
      <button
        class="login-btn"
        :class="{ 'theme-login-btn': statusStore.isDarkMode }"
      >
        login
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.theme-login-input {
  color: $theme-dark-font-color !important;
  border-bottom: 2px solid $theme-dark-font-color !important;
}

.theme-login-btn {
  background-color: $theme-dark-button-color !important;
  color: black;
}

.login-view {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: $theme-light-color;

  .blank {
    height: 10px;
  }

  .login-header {
    display: flex;
    flex-direction: column;
    align-items: center;

    .logo {
      margin: 40px;
      transform: scale(1.3);
    }

    .h1 {
      font-size: 25px;
      font-weight: bold;
    }

    .p {
      margin-top: 10px;
      font-size: 14px;
    }
  }

  .login-main {
    display: flex;
    flex-direction: column;
    padding: 0 30px;
    margin-top: 50px;

    .input-box {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
      cursor: pointer;

      .input-item {
        align-self: self-start;
        transition: all 0.3s ease;
        font-weight: bold;

        .error-tip {
          color: red;
          font-size: 12px;
        }
      }

      .login-input {
        padding: 10px 0;
        color: $theme-light-font-color;
        background-color: transparent;
        transition: all 0.3s ease;
        border-bottom: 2px solid $theme-light-font-color;
      }

      .error {
        border-bottom: 2px solid red !important;
      }
    }

    .login-btn {
      margin-top: 20px;
      width: 100%;
      height: 50px;
      line-height: 50px;
      background-color: $theme-light-button-color;
      border-radius: $gap;
    }
  }
}
</style>
