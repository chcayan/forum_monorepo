<script setup lang="ts">
import PostSvg from '@/components/svgIcon/PostSvg.vue'
import ChatSvg from '@/components/svgIcon/ChatSvg.vue'
import PublishSvg from '@/components/svgIcon/PublishSvg.vue'
import MySvg from '@/components/svgIcon/MySvg.vue'
import SettingSvg from '@/components/svgIcon/SettingSvg.vue'
import LogoSvg from '@/components/svgIcon/LogoSvg.vue'
import Light from '@/components/svgIcon/LightSvg.vue'
import Dark from '@/components/svgIcon/DarkSvg.vue'
import { ref } from 'vue'

import type { Component } from 'vue'

const currentTheme = ref(localStorage.getItem('theme') || 'Light')
const tabs: Record<string, Component> = {
  Light,
  Dark,
}

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'Light' ? 'Dark' : 'Light'
  localStorage.setItem('theme', currentTheme.value)
  document.body.dataset.theme = currentTheme.value
}
</script>

<template>
  <header>
    <div class="logo">
      <LogoSvg class="svg" />
      <span>forum</span>
    </div>
    <nav>
      <router-link to="/"><PostSvg /></router-link>
      <router-link to="/chat"><ChatSvg /></router-link>
      <router-link to="/publish"><PublishSvg /></router-link>
      <router-link to="/user" class="mobile"><MySvg /></router-link>
      <router-link to="/setting" class="mobile"><SettingSvg /></router-link>
    </nav>
    <div class="my">
      <span @click="toggleTheme">
        <component :is="tabs[currentTheme]"></component>
      </span>
      <img src="/avatar.jpg" />
    </div>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped lang="scss">
$gap: 10px;
header {
  display: flex;
  justify-content: center;
  width: 90%;
  max-width: 800px;
  margin: 10px auto 0;
  height: 60px;
  background-color: var(--theme-nav-color);
  box-shadow: 0px 0px 2px var(--theme-shadow-color);
  padding: 10px;
  border-radius: $gap;

  .logo {
    display: flex;
    align-items: center;
    gap: $gap;
    flex: 1;

    span {
      color: var(--theme-font-color);
    }

    .svg {
      width: 40px;
      height: 40px;
      user-select: none;
    }
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 2;
    gap: $gap * 2;

    .router-link-exact-active {
      border-radius: 4px;
      box-shadow: 0 0 0 7px var(--theme-tag-active-color);
      transition: all 0.3s ease;
      background-color: var(--theme-tag-active-color);
    }

    .mobile {
      display: none;
    }
  }

  .my {
    display: flex;
    align-items: center;
    justify-content: end;
    flex: 1;
    gap: $gap;

    span {
      cursor: pointer;
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      user-select: none;
      cursor: pointer;
    }
  }

  @media (max-width: $mobile-size) {
    width: 100%;
    position: fixed;
    border-radius: initial;
    bottom: 0;

    .logo {
      display: none;
    }

    nav {
      display: flex;
      gap: $gap * 3;

      .mobile {
        display: initial;
      }
    }

    .my {
      display: none;
    }
  }
}

main {
  display: flex;
  justify-content: center;
  margin-top: $gap * 2;
  color: var(--theme-font-color);
}
</style>
