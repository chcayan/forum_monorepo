<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import type { Component } from 'vue'

import Login from './components/LoginBox.vue'
import Signup from './components/SignupBox.vue'
import emitter from '@/utils/eventEmitter'
import { useUserStore } from '@/stores'

const currentTab = ref('Login')
const tabs: Record<string, Component> = {
  Login,
  Signup,
}

const toggle = () => {
  currentTab.value = currentTab.value === 'Login' ? 'Signup' : 'Login'
}

let off = emitter.on('TAB:LOGIN', () => {
  toggle()
})

const userStore = useUserStore()

onUnmounted(() => {
  off?.()
  userStore.setCN_VERSION('enabled')
})

const icpHtml = import.meta.env.VITE_ICP_HTML
const icpHtml1 = import.meta.env.VITE_ICP_HTML_1
</script>

<template>
  <section class="login-view" v-if="userStore.CN_VERSION === 'disabled'">
    <component :is="tabs[currentTab]"></component>
    <footer>
      <div v-if="currentTab === 'Login'">
        <p>Don't have an account?</p>
        <button @click="toggle">Sign Up</button>
      </div>
      <div v-else>
        <p>If you have an account, please</p>
        <button @click="toggle">login</button>
      </div>
    </footer>
  </section>
  <section class="login-view cn" v-else>
    <p>暂时不支持登录/注册😶‍🌫️</p>
  </section>
  <section
    class="icp"
    v-if="userStore.CN_VERSION !== 'disabled'"
    v-html="`${icpHtml}#${icpHtml1}`"
  ></section>
</template>

<style scoped lang="scss">
.icp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 60px;
  width: 280px;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0px;
  @media (max-width: 425px) {
    bottom: 60px;
  }
}

.cn {
  justify-content: center;
  height: 200px;

  p {
    font-size: 20px;
    font-weight: bold;
  }
}

.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  padding: $gap;
  box-shadow: var(--theme-shadow-color);
  border-radius: $gap;
  background-color: var(--theme-post-card-color);

  @media (max-width: $mobile-size) {
    margin: $gap $gap 0;
    width: 100%;
  }

  footer {
    div {
      display: flex;
      gap: $gap * 0.5;
      margin-bottom: $gap;

      button {
        color: var(--theme-font-color);
        font-weight: bold;
        text-decoration: underline;
      }
    }
  }
}
</style>
