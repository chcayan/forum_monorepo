<script setup lang="ts">
import SearchSvg from '@/components/svgIcon/SearchSvg.vue'
import { useUserStore } from '@/stores'
import { FriendInfo } from '@forum-monorepo/types'
import { ref } from 'vue'

const userStore = useUserStore()
const friendList = ref<FriendInfo[]>([])

const getFriendList = () => {
  friendList.value = userStore.userFriendList
  console.log(friendList.value)
}
getFriendList()

const showChatBox = ref(false)
</script>

<template>
  <div class="chat-view">
    <div class="left">
      <div class="title">
        <h2 @click="showChatBox = !showChatBox">聊天</h2>
        <label>
          <input type="text" placeholder="搜索用户" />
          <SearchSvg class="search" />
        </label>
      </div>
      <ul>
        <li v-for="friend in userStore.userFriendList" :key="friend.follow_id">
          <img :src="friend.user_avatar" alt="avatar" />
          <div>{{ friend.username }}</div>
        </li>
      </ul>
    </div>
    <div class="right" :class="{ 'right-up': showChatBox }">
      <div>聊天.....</div>
      <button @click="showChatBox = !showChatBox">×</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-view {
  display: flex;
  max-width: 1000px;
  width: calc(100vw - 20px);
  height: calc(100vh - 90px);
  border-radius: 10px;
  box-shadow: var(--theme-shadow-color);
  background-color: var(--theme-color);
  overflow: hidden;
  position: relative;

  .left {
    width: 250px;
    padding: 10px;
    box-shadow: var(--theme-shadow-color);

    .title {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      margin-left: 10px;

      label {
        position: relative;
        margin-left: auto;
        cursor: pointer;

        input {
          background-color: var(--theme-textarea-bg-color);
          width: 120px;
          height: 40px;
          padding-left: 10px;
          padding-right: 45px;
          border-radius: 10px;
          color: var(--theme-font-color);

          &::placeholder {
            color: var(--theme-font-color);
            opacity: 0.5;
          }
        }

        .search {
          position: absolute;
          right: 8px;
          top: 4px;
          opacity: 0.5;
        }
      }
    }

    ul {
      display: flex;
      flex-direction: column;

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 10px;
        padding: 10px;
        transition: all 0.3s ease;

        &:hover {
          background-color: var(--theme-chat-item-bg-hover-color);
        }

        img {
          width: 50px;
          height: 50px;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 50%;
        }

        div {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
      }
    }
  }

  .right {
    width: calc(100% - 250px);
    padding: 10px;
    background-color: var(--theme-avatar-widget-color);
  }

  @media (max-width: 600px) {
    flex-direction: column;

    .left {
      width: 100%;
    }

    .right {
      // display: none;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transform: translateY(100%);
      transition: all 0.3s ease;

      // &:hover {
      //   transform: translateY(0);
      // }
    }

    .right-up {
      transform: translateY(0);
    }
  }

  @media (max-width: $mobile-size) {
    height: calc(100vh - 80px);
    margin-top: 10px;
  }
}
</style>
