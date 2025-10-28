<script setup lang="ts">
import { loginAPI } from '@/api'
import LogoSvg from '@/components/svgIcon/LogoSvg.vue'
import router, { RouterPath } from '@/router'
import { useUserStore } from '@/stores'
import { debounce, isValidEmail, isValidPassword, Toast } from '@/utils'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
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
  <header class="login-header">
    <LogoSvg class="logo" />
    <h1>Welcome back!</h1>
    <p>Please enter you details</p>
  </header>
  <form @submit.prevent="submitForm" class="login-main">
    <label>
      <input
        :class="{ error: !isEmailValid }"
        v-model="email"
        @input="verifyEmail"
        type="text"
        required
      />
      <p>
        Email
        <span v-if="!isEmailValid"> - 邮箱格式不正确</span>
      </p>
    </label>
    <label>
      <input
        :class="{ error: !isPasswordValid }"
        v-model="password"
        @input="verifyPassword"
        type="password"
        required
      />
      <p>
        Password
        <span v-if="!isPasswordValid"> - 只允许数字/字母/符号,长度6-16</span>
      </p>
    </label>
    <button>login</button>
  </form>
</template>

<style scoped lang="scss">
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;

  .logo {
    margin: 40px;
    transform: scale(1.3);
  }

  p {
    margin-top: 10px;
    font-size: 14px;
  }
}

.login-main {
  display: flex;
  flex-direction: column;
  width: 300px;
  margin-top: 50px;
  margin-bottom: 160px;

  label {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    cursor: pointer;

    p {
      align-self: self-start;
      transition: all 0.3s ease;
      transform: translateY(-35px) scale(1);
      transform-origin: center left;

      span {
        color: red;
      }
    }

    input {
      width: 100%;
      padding: 5px;
      color: var(--theme-font-color);
      background-color: transparent;
      transition: all 0.3s ease;
      border-bottom: 2px solid var(--theme-font-color);

      &:focus + p,
      &:valid + P {
        width: 350px;
        transform: translateY(-50px) scale(0.8);
      }
    }

    .error {
      border-bottom: 2px solid red !important;
    }
  }

  button {
    height: 40px;
    background-color: var(--theme-button-color);
    border-radius: $gap;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--theme-button-hover-color);
    }
  }
}
</style>
