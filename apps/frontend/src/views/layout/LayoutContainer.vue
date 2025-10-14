<script setup lang="ts">
import PostSvg from '@/components/svgIcon/PostSvg.vue'
import ChatSvg from '@/components/svgIcon/ChatSvg.vue'
import PublishSvg from '@/components/svgIcon/PublishSvg.vue'
import LightSvg from '@/components/svgIcon/LightSvg.vue'

console.log(import.meta.env.VITE_PORT)
</script>

<template>
  <header>
    <div class="home">
      <img src="../../../public/forum.svg" alt="" />
      <span>forum</span>
    </div>
    <nav>
      <router-link to="#1"><PostSvg /></router-link>
      <router-link to="#2"><PublishSvg /></router-link>
      <router-link to="#3"><ChatSvg /></router-link>
    </nav>
    <div class="my">
      <LightSvg />
      <img src="../../../public/avatar.jpg" alt="" />
    </div>
  </header>
  <main></main>
</template>

<style scoped lang="scss">
$gap: 10px;
header {
  display: flex;
  justify-content: center;
  width: 80%;
  margin: 10px auto 0;
  height: 60px;
  background-color: var(--theme-color);
  box-shadow: 0px 0px 2px var(--theme-shadow-color);
  padding: 10px;
  border-radius: $gap;

  .home {
    display: flex;
    align-items: center;
    gap: $gap;
    flex: 1;

    img {
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

    .router-link-active {
      height: 32px;
    }
  }

  .my {
    display: flex;
    align-items: center;
    justify-content: end;
    flex: 1;
    gap: $gap;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      user-select: none;
      cursor: pointer;
    }
  }
}
</style>
