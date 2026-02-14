<script setup lang="ts">
import { onUpdated, reactive, ref, useTemplateRef } from 'vue'
import { lineBreakReplace, socket } from '@/utils'
import CloseSvg from '../svgIcon/CloseSvg.vue'
import JumpSvg from '../svgIcon/JumpSvg.vue'
import SendSvg from '../svgIcon/SendSvg.vue'
import { useTempStore, useUserStore } from '@/stores'
import { ChatToastParams } from './types'
import { escapeHTML } from '@/utils/format'
import router, { RouterPath } from '@/router'
import { markAsReadAPI } from '@/api'
import SharePost from '@/views/chat/components/SharePost.vue'

const y = ref('-200px')
const toastRef = useTemplateRef('toast')

const chatBoxRef = useTemplateRef('chatBoxEl')

const scrollToBottom = () => {
  const el = chatBoxRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

onUpdated(() => {
  scrollToBottom()
})

const _username = ref('')
const _userId = ref('')
const avatar = ref('')
const sendMsg = ref('')

type MsgType = {
  postId: string
  message: string
  isShare: '0' | '1'
}
const chatRecords = reactive<Record<string, MsgType[]>>({})
const userList = ref<Map<string, UserInfo>>(new Map())

type UserInfo = {
  userId: string
  username: string
  userAvatar: string
}

const chooseUser = (userId: string) => {
  _userId.value = userId
  _username.value = userList.value.get(userId)?.username as string
  avatar.value = userList.value.get(userId)?.userAvatar as string
}

const sendMessage = async (e: PointerEvent | KeyboardEvent) => {
  const userStore = useUserStore()

  if (e instanceof KeyboardEvent) {
    if (e.key === 'Enter' && e.shiftKey) return
  }

  const msg = escapeHTML(sendMsg.value.trim())

  const payload = {
    from: userStore.userInfo.userId,
    to: _userId.value,
    message: msg,
  }

  socket.emit('sendMessage', payload)

  await markAsReadAPI({
    followId: _userId.value,
  })

  sendMsg.value = ''

  if (userList.value.size > 1) {
    userList.value.delete(_userId.value)
    chooseUser(userList.value.values().next().value?.userId as string)
  } else {
    closeChatToast()
  }
}

class ChatToast {
  static isShowing = false

  /**
   * 显示聊天弹窗
   * @param userInfo 用户头像，id，用户名，接收的信息
   */
  static show(userInfo: ChatToastParams) {
    const { userAvatar, userId, username, message, is_share } = userInfo

    if (!userList.value.get(userId)) {
      userList.value.set(userId, {
        userId,
        username,
        userAvatar,
      })
    }

    _userId.value = userId
    _username.value = username
    avatar.value = userAvatar

    if (!chatRecords[_userId.value]) {
      chatRecords[_userId.value] = []
    }

    chatRecords[_userId.value]?.push({
      message,
      isShare: is_share,
      postId: is_share === '1' ? message : '',
    })

    if (!ChatToast.isShowing) {
      ChatToast.isShowing = true
      toastRef.value?.animate(
        [{ transform: `translateY(0) translateX(-50%)` }],
        { duration: 700, easing: 'ease', fill: 'forwards' }
      )
    }
  }

  /**
   * 关闭弹窗
   */
  static hide() {
    ChatToast.isShowing = false
    toastRef.value?.animate(
      [
        {
          transform: `translateY(${y.value}) translateX(-50%)`,
        },
      ],
      {
        duration: 700,
        easing: 'ease',
        fill: 'forwards',
      }
    )
  }
}

const closeChatToast = () => {
  Object.keys(chatRecords).forEach((key) => {
    delete chatRecords[key]
  })

  userList.value.clear()

  ChatToast.hide()
}

const navigateToChat = async () => {
  const tempStore = useTempStore()
  router.push(RouterPath.chat)
  tempStore.setTempUserInfo({
    userId: _userId.value,
    username: _username.value,
    userAvatar: avatar.value,
  })
  closeChatToast()
}

defineExpose({
  show: ChatToast.show,
})
</script>

<template>
  <div class="chat-toast" ref="toast">
    <ul v-if="userList.size">
      <li
        v-for="(item, index) in userList"
        :key="index"
        :class="{ active: _userId === item[1].userId }"
      >
        <img
          v-if="avatar"
          v-loading
          :src="item[1].userAvatar"
          @click="chooseUser(item[1].userId)"
        />
      </li>
    </ul>
    <div class="user-info">
      <span>{{ _username }}</span>
      <CloseSvg class="ico" @click="closeChatToast" />
      <JumpSvg class="ico" @click="navigateToChat" />
    </div>
    <div class="chat-box" ref="chatBoxEl">
      <div
        class="chat"
        v-for="(item, index) in chatRecords[_userId]"
        :key="index"
      >
        <img v-if="avatar" v-loading :src="avatar" />
        <span
          v-if="item.isShare === '0'"
          class="msg"
          v-html="lineBreakReplace(item.message)"
        ></span>
        <div v-else>
          <SharePost style="text-align: start" :post-id="item.postId" />
        </div>
      </div>
    </div>
    <form class="ipt" @submit.prevent>
      <textarea
        ref="input"
        v-disableEnter
        v-model.trim="sendMsg"
        @keydown.enter="sendMessage($event)"
        placeholder="Please input your message..."
      ></textarea>
      <button @click="sendMessage($event)" title="发送">
        <SendSvg />
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
$main-gap: 20px;
.chat-toast {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: $toast-z-index;
  width: auto;
  min-width: 300px;
  margin-top: 20px;
  font-size: 14px;
  padding: 10px 15px;
  text-align: center;
  border-radius: 10px;
  background-color: var(--theme-color);
  box-shadow: var(--theme-shadow-color);
  transform: translateY(v-bind(y)) translateX(-50%);

  ul {
    position: absolute;
    top: 0px;
    left: -70px;
    padding: 10px;
    border-radius: 10px;
    background-color: var(--theme-color);
    box-shadow: var(--theme-shadow-color);
    display: flex;
    flex-direction: column;
    gap: 10px;

    .active {
      background-color: var(--theme-chat-speech-bubble-color);
      box-shadow: 0 0 0 3px var(--theme-chat-speech-bubble-color);
      border-radius: 10px;
    }

    li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;

      img {
        width: 30px;
        height: 30px;
        aspect-ratio: 1;
        border-radius: 50%;
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;

    span {
      margin-right: auto;
    }

    .ico {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    img {
      width: 40px;
      height: 40px;
      aspect-ratio: 1;
      border-radius: 50%;
    }
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 200px;
    overflow-y: scroll;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: var(--theme-scrollbar-thumb-color);
    }

    .chat {
      display: flex;
      gap: 10px;

      .msg {
        padding: 10px;
        border-radius: 10px;
        background-color: var(--theme-chat-speech-bubble-color);
        max-width: 200px;
        color: var(--theme-font-color);
        text-align: start;
        word-break: break-all;
      }

      img {
        width: 30px;
        height: 30px;
        aspect-ratio: 1;
        border-radius: 50%;
      }
    }
  }

  .ipt {
    display: flex;
    align-items: center;
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: var(--theme-shadow-color);
    transition: all 0.3s ease;
    margin-top: 10px;

    button {
      height: 60px;
      border: none;
      outline: none;
      padding: 0 calc($main-gap / 1.3);
      border-radius: 0 calc($main-gap / 2) calc($main-gap / 2) 0;
      background-color: var(--theme-send-button-color);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background-color: var(--theme-send-button-hover-color);
      }
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
</style>
