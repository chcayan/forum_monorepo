<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { getChatHistoryAPI, getChatUnreadAPI, markAsReadAPI } from '@/api'
import CloseSvg from '@/components/svgIcon/CloseSvg.vue'
import SearchSvg from '@/components/svgIcon/SearchSvg.vue'
import SendSvg from '@/components/svgIcon/SendSvg.vue'
import { useUserStore } from '@/stores'
import { lineBreakReplace, socket, Toast } from '@/utils'
import { escapeHTML } from '@/utils/format'
import { ChatInfo, FriendInfo } from '@forum-monorepo/types'
import {
  onDeactivated,
  onMounted,
  onUpdated,
  reactive,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const friendList = ref<FriendInfo[]>([])

const getFriendList = () => {
  friendList.value = userStore.userFriendList
  console.log(friendList.value)
}
getFriendList()

const showChatBox = ref(false)

const openChatBox = () => {
  showChatBox.value = true
}

const closeChatBox = () => {
  currentFriendUserId.value = ''
  currentFriendUsername.value = ''
  currentFriendAvatar.value = ''
  showChatBox.value = false
}

onDeactivated(() => {
  closeChatBox()
})

const currentFriendUsername = ref('')
const currentFriendAvatar = ref('')
const currentFriendUserId = ref('')
const selectFriend = (username: string, avatar: string, userId: string) => {
  openChatBox()
  currentFriendUsername.value = username
  currentFriendAvatar.value = avatar
  currentFriendUserId.value = userId
}

const scrollToBottom = () => {
  if (!currentFriendUserId.value) return
  const el = messageBoxRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

const messageBoxRef = useTemplateRef('messageBoxEl')

const fetchUnread = async () => {
  const res = await getChatUnreadAPI()
  const data = res.data.data
  if (!data) return

  data.forEach(({ sender, count }: { sender: string; count: number }) => {
    unreadCount[sender] = count
  })
}

onMounted(async () => {
  await fetchUnread()
})

const message = ref('')

const sendMessage = (
  e: KeyboardEvent | PointerEvent,
  chatBoxMsg?: string,
  sender?: string
) => {
  if (e instanceof KeyboardEvent) {
    if (e.key === 'Enter' && e.shiftKey) return
  }

  if (!currentFriendUserId.value) {
    return
  }

  let msg

  if (!route.fullPath.startsWith('/chat')) {
    msg = chatBoxMsg?.trim()
  } else {
    msg = message.value.trim()
  }
  console.log(666)
  if (!msg) {
    Toast.show({
      msg: '请输入信息',
      type: 'error',
    })
    return
  }

  msg = escapeHTML(msg)

  if (!chatBoxMsg) {
    const el = messageBoxRef.value
    if (el) {
      el.style.scrollBehavior = 'smooth'
    }
  }

  const payload = {
    from: userStore.userInfo.user_id,
    to: currentFriendUserId.value || sender,
    message: msg,
  }

  socket.emit('sendMessage', payload)

  if (!chatRecords[currentFriendUserId.value]) {
    chatRecords[currentFriendUserId.value] = []
  }

  chatRecords[currentFriendUserId.value].push({
    from: userStore.userInfo.user_id,
    message: msg,
  })
  message.value = ''
}

const route = useRoute()
const chatRecords = reactive<Record<string, any>>({})
const unreadCount = reactive<Record<string, any>>({})

socket.on(
  'receiveMessage',
  async ({ from, message }: { from: string; message: string }) => {
    console.log('onReceiveMessage')
    if (!chatRecords[from]) chatRecords[from] = []
    chatRecords[from].push({ from, message })

    if (currentFriendUserId.value !== from) {
      unreadCount[from] = (unreadCount[from] || 0) + 1
    }

    if (currentFriendUserId.value === from) {
      await markAsReadAPI({
        from,
      })
      unreadCount[from] = 0
    }
  }
)

watch(currentFriendUserId, async (friend) => {
  if (!friend) return

  const el = messageBoxRef.value
  if (el) {
    el.style.scrollBehavior = 'auto'
  }
  await markAsReadAPI({ from: friend })
  unreadCount[friend] = 0

  const res = await getChatHistoryAPI(friend)
  const history = res.data.data
  if (!history) return

  chatRecords[friend] = history.map((msg: ChatInfo) => ({
    from: msg.sender,
    message: msg.content,
  }))
})

onUpdated(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-view">
    <div class="left">
      <div class="title">
        <h2 @click="openChatBox">聊天</h2>
        <label>
          <input type="text" placeholder="搜索用户" />
          <SearchSvg class="search" />
        </label>
      </div>
      <ul v-if="userStore.userFriendList.length">
        <li
          tabindex="0"
          class="tab-focus-style"
          :class="{ active: friend.follow_id === currentFriendUserId }"
          v-for="friend in userStore.userFriendList"
          :key="friend.follow_id"
          @click="
            selectFriend(friend.username, friend.user_avatar, friend.follow_id)
          "
          @keydown.enter="
            selectFriend(friend.username, friend.user_avatar, friend.follow_id)
          "
        >
          <img :src="friend.user_avatar" alt="avatar" />
          <div>{{ friend.username }}</div>
          <div
            v-if="unreadCount[friend.follow_id]"
            :title="`${unreadCount[friend.follow_id]}条消息未读`"
            class="unread-count"
          >
            {{ unreadCount[friend.follow_id] }}
          </div>
        </li>
      </ul>
      <div v-else class="f-tip">你还未有好友</div>
    </div>
    <div class="right" :class="{ 'right-up': showChatBox }">
      <div class="chat-box" v-if="currentFriendUsername">
        <header>
          <img :src="currentFriendAvatar" />
          <div>{{ currentFriendUsername }}</div>
          <div class="close-box" @click="closeChatBox">
            <CloseSvg class="close" />
          </div>
        </header>
        <div class="main tab-focus-style" ref="messageBoxEl">
          <div
            class="text"
            v-for="(msg, index) in chatRecords[currentFriendUserId] || []"
            :key="index"
          >
            <div
              class="user-chat"
              v-if="msg.from === userStore.userInfo.user_id"
            >
              <span v-html="lineBreakReplace(msg.message)"></span>
              <img :src="userStore.userInfo?.user_avatar" />
            </div>
            <div
              class="follow-chat"
              v-if="msg.from !== userStore.userInfo.user_id"
            >
              <img :src="currentFriendAvatar" />
              <span v-html="lineBreakReplace(msg.message)"></span>
            </div>
          </div>
        </div>
        <footer>
          <form class="chat-input" @submit.prevent>
            <textarea
              v-disableEnter
              name="chat"
              v-model.trim="message"
              @keydown.enter="sendMessage($event)"
              placeholder="Please input your message..."
            ></textarea>
            <button @click="sendMessage($event)" title="发送">
              <SendSvg />
            </button>
          </form>
        </footer>
      </div>
      <div class="tip" v-else>请选择一位好友</div>
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

    .f-tip {
      margin-top: 10px;
      width: 100%;
      text-align: center;
    }

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

      .active {
        background-color: var(--theme-chat-item-bg-hover-color);
      }

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 10px;
        padding: 10px;
        cursor: pointer;

        .unread-count {
          user-select: none;
          margin-left: auto;
          margin-right: 10px;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          color: var(--theme-font-color);
          border-radius: 50%;
          background-color: var(--theme-chat-speech-bubble-color);
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
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: calc(100% - 250px);

    .tip {
      width: 100%;
      text-align: center;
      opacity: 0.5;
    }

    .chat-box {
      display: flex;
      flex-direction: column;
      height: 100%;

      header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        width: 100%;
        height: 60px;
        box-shadow: 0 1px 1px rgba(156, 164, 172, 0.3);

        .close-box {
          align-self: flex-end;
          margin-left: auto;
          margin-right: 10px;
        }

        img {
          width: 40px;
          height: 40px;
          aspect-ratio: 1;
          border-radius: 50%;
        }
      }

      .main {
        width: 100%;
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
        padding: 20;
        overflow-y: scroll;
        padding: 10px;

        .text {
          font-size: 14px;
          width: 100%;
          word-break: break-all;

          .user-chat {
            justify-content: end;

            img {
              margin-left: 10px;
            }
          }

          .follow-chat {
            img {
              margin-right: 10px;
            }
          }

          div {
            display: flex;

            span {
              padding: 10px;
              border-radius: 10px;
              background-color: var(--theme-chat-speech-bubble-color);
              max-width: 50%;
            }

            img {
              width: 32px;
              height: 32px;
              aspect-ratio: 1;
              border-radius: 50%;
            }
          }
        }

        &::-webkit-scrollbar {
          width: 10px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-color: var(--theme-scrollbar-thumb-color);
        }
      }

      footer {
        width: 100%;
        height: 60px;

        .chat-input {
          display: flex;
          align-items: center;
          width: 100%;
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 -1px 1px rgba(156, 164, 172, 0.3);

          button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 60px;
            border: none;
            outline: none;
            padding: 0 10px;
            border-radius: 0 10px 10px 0;
            background-color: var(--theme-send-button-color);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          textarea {
            width: 100%;
            height: 60px;
            resize: none;
            padding: 10px;
            border: none;
            outline: none;
            color: var(--theme-font-color);
            background-color: var(--theme-color);
            transition: all 0.3s ease;
            border-radius: 10px 0 0 0;
            font-family: system-ui;

            &::-webkit-scrollbar {
              width: 0;
              height: 0;
            }

            &::placeholder {
              color: var(--theme-font-color);
            }
          }

          &:has(textarea:focus) {
            box-shadow: 0 0 7px var(--theme-button-hover-color);
          }
        }
      }
    }

    .close {
      display: none;
      cursor: pointer;
    }
  }

  @media (max-width: 600px) {
    flex-direction: column;

    .left {
      width: 100%;
      box-shadow: initial;
    }

    .right {
      width: 100%;
      height: calc(100vh - 90px);
      height: calc(100dvh - 90px);
      position: absolute;
      background-color: var(--theme-color);
      top: 0;
      left: 0;
      z-index: -1;
      transform: translateY(100%);
      border-radius: 10px;
      transition: all 0.3s linear;
      opacity: 0;

      .close {
        display: initial;
      }
    }

    .right-up {
      z-index: 1;
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: $mobile-size) {
    height: calc(100vh - 80px);
    margin-top: 10px;

    .right {
      height: calc(100vh - 80px);
      height: calc(100dvh - 80px);
      border-radius: 10px;
      background-color: var(--theme-color);
    }
  }
}
</style>
