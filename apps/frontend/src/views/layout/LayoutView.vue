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
import { useUserStore } from '@/stores'
import router, { RouterPath } from '@/router'
import emitter from '@/utils/eventEmitter'
import BackSvg from '@/components/svgIcon/BackSvg.vue'
import { useRoute } from 'vue-router'
import SendSvg from '@/components/svgIcon/SendSvg.vue'

const userStore = useUserStore()

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

const showAvatarWidget = ref(false)
const toggleWidgetVisible = () => {
  showAvatarWidget.value = !showAvatarWidget.value
}

const navigateToUser = () => {
  router.push(RouterPath.user)
  showAvatarWidget.value = false
}

const navigateToSetting = () => {
  router.push(RouterPath.setting)
  showAvatarWidget.value = false
}

emitter.on('TAB:CLOSE_AVATAR_WIDGET', () => {
  showAvatarWidget.value = false
})

const route = useRoute()

const showBackBtn = () => {
  if (
    route.path === RouterPath.base ||
    route.path.startsWith(RouterPath.chat) ||
    route.path.startsWith(RouterPath.publish)
  ) {
    return true
  }
  return false
}

const publishPostBtn = () => {
  emitter.emit('EVENT:PUBLISH_POST')
  console.log('publish_post')
}
</script>

<template>
  <header class="layout-view">
    <div class="logo">
      <LogoSvg v-if="showBackBtn()" class="svg" title="forum" />
      <div
        tabindex="0"
        class="tab-focus-style back"
        @click="router.back()"
        v-else
      >
        <BackSvg />
      </div>
    </div>
    <nav>
      <router-link to="/"><PostSvg /></router-link>
      <router-link to="/chat"><ChatSvg /></router-link>
      <router-link to="/publish">
        <PublishSvg v-if="!route.path.startsWith(RouterPath.publish)" />
        <SendSvg v-else @click="publishPostBtn" />
      </router-link>
      <router-link to="/user" class="mobile"><MySvg /></router-link>
      <router-link to="/setting" class="mobile"><SettingSvg /></router-link>
    </nav>
    <div class="my">
      <button @click="toggleTheme">
        <component :is="tabs[currentTheme]"></component>
      </button>
      <button
        @click="router.push(RouterPath.login)"
        v-if="!userStore.token"
        class="login"
        title="登录"
      >
        登录
      </button>
      <div
        v-if="userStore.token"
        tabindex="0"
        class="avatar tab-focus-style"
        @keydown.enter="toggleWidgetVisible"
      >
        <img
          v-loading
          loading="lazy"
          :src="userStore.userInfo?.user_avatar"
          alt="avatar"
          @click="toggleWidgetVisible"
          :title="userStore.userInfo?.username"
        />
        <transition name="widget">
          <div ref="widget" v-if="showAvatarWidget" class="widget">
            <p class="info">{{ userStore.userInfo?.username }}</p>
            <p class="info">{{ userStore.userInfo?.user_email }}</p>
            <button title="个人中心" @click="navigateToUser">
              <p class="btn">个人中心</p>
              <MySvg class="btn-icon" title="个人中心" />
            </button>
            <button title="设置" @click="navigateToSetting">
              <p class="btn">设置</p>
              <SettingSvg class="btn-icon" />
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
  <main class="layout-view-main">
    <!-- <router-view /> -->
    <router-view v-slot="{ Component }">
      <keep-alive :include="['PostView']">
        <component :is="Component"></component>
      </keep-alive>
    </router-view>
  </main>
</template>

<style scoped lang="scss">
.layout-view {
  display: flex;
  width: 90%;
  max-width: $nav-max-width;
  margin: 10px auto 0;
  height: 60px;
  background-color: var(--theme-nav-color);
  box-shadow: 0px 0px 2px var(--theme-shadow-color);
  padding: 10px;
  border-radius: $gap;
  position: fixed;
  z-index: $tab-z-index;

  .logo {
    display: flex;
    align-items: center;
    gap: $gap;
    flex: 1;

    .back {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background-color: var(--theme-button-color);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--theme-button-hover-color);
      }
    }

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

    .login {
      width: 50px;
      height: 32px;
      border-radius: 10px;
      background-color: var(--theme-button-color);
      transition: all 0.3s ease;

      &:hover {
        background-color: var(--theme-button-hover-color);
      }
    }

    button {
      width: 32px;
      height: 32px;
      background-color: transparent;
    }

    .avatar {
      img {
        position: relative;
        z-index: $avatar-z-index + 1;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        user-select: none;
        cursor: pointer;
      }

      .widget {
        position: absolute;
        top: 0;
        right: 0;
        z-index: $avatar-z-index;
        width: 200px;
        height: auto;
        padding: 10px;
        border-radius: 10px;
        background-color: var(--theme-avatar-widget-color);
        box-shadow: 0 0 2px var(--theme-shadow-color);

        .info {
          display: -webkit-box;
          line-clamp: 1;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          // text-align: end;
          color: var(--theme-font-color);
          width: 130px;
          height: 20px;
          line-height: 20px;
          font-size: 14px;
        }

        button {
          display: flex;
          align-items: center;
          justify-content: end;
          width: 100%;
          height: 40px;
          margin-top: 5px;
          border-radius: 10px;
          transition: all 0.3s ease;

          &:hover {
            background-color: var(--theme-button-hover-color);
          }

          .btn {
            color: var(--theme-font-color);
          }

          .btn-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
          }
        }
      }

      .widget-enter-active,
      .widget-leave-active {
        transition: all 0.3s ease;
        transform-origin: 185px 15px;
      }

      .widget-enter-from,
      .widget-leave-to {
        transform: scale(0.2);
        border-radius: 50%;
        opacity: 0;
      }
    }
  }

  @media (max-width: $mobile-size) {
    width: 100%;
    position: fixed;
    border-radius: initial;
    bottom: 0;
    z-index: $tab-z-index;

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

.layout-view-main {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: $gap * 2;
  color: var(--theme-font-color);
  padding: 60px 0 $gap;

  @media (max-width: $mobile-size) {
    margin-top: initial;
    padding: 0 0 70px;
  }
}
</style>
