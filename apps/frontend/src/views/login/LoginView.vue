<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'

import Login from './components/LoginBox.vue'
import Signup from './components/SignupBox.vue'
import emitter from '@/utils/eventEmitter'

const currentTab = ref('Login')
const tabs: Record<string, Component> = {
  Login,
  Signup,
}

const toggle = () => {
  currentTab.value = currentTab.value === 'Login' ? 'Signup' : 'Login'
}

emitter.on('TAB:LOGIN', () => {
  toggle()
})
</script>

<template>
  <section class="login-view">
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
</template>

<style scoped lang="scss">
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  padding: $gap;
  box-shadow: 0 0 2px var(--theme-shadow-color);
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
