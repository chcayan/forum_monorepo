<script setup lang="ts">
import {
  getChatHistoryAPI,
  getChatUnreadAPI,
  markAsReadAPI,
  searchUserAPI,
} from '@/api'
import CloseIcon from '@/components/icon/CloseIcon.vue'
import SearchIcon from '@/components/icon/SearchIcon.vue'
import SendIcon from '@/components/icon/SendIcon.vue'
import { useUserStore, useStatusStore } from '@/stores'
import {
  debounce,
  lineBreakReplace,
  getImgUrl,
  RouterPath,
  getCurrentRoute,
  socket,
} from '@/utils'
import emitter from '@/utils/eventEmitter'
import { escapeHTML } from '@/utils/format'
import type { ChatInfo, UserBySearchInfo } from '@/types'
import { onActivated, reactive, ref, watch, nextTick } from 'vue'
import { onPageScroll, onShow } from '@dcloudio/uni-app'
import SharePost from '@/components/chat/SharePost.vue'

const userStore = useUserStore()
const statusStore = useStatusStore()

const showChatBox = ref(false)

const openChatBox = () => {
  showChatBox.value = true
}

const closeChatBox = () => {
  chatRecords[currentFriendUserId.value] = []
  currentFriendUserId.value = ''
  currentFriendUsername.value = ''
  currentFriendAvatar.value = ''
  showChatBox.value = false
}

const currentFriendUsername = ref('')
const currentFriendAvatar = ref('')
const currentFriendUserId = ref('')
const selectFriend = (username: string, avatar: string, userId: string) => {
  openChatBox()
  showSearchBox.value = false
  currentFriendUsername.value = username
  currentFriendAvatar.value = avatar
  currentFriendUserId.value = userId
}

const fetchUnread = async () => {
  const res = await getChatUnreadAPI()
  const data = res.data.data

  data.forEach(({ sender, count }: { sender: string; count: number }) => {
    unreadCount[sender] = count
  })
}

const messageBoxEl = ref()
const message = ref('')

const sendMessage = async () => {
  if (!currentFriendUserId.value) {
    return
  }

  const msg = escapeHTML(message.value.trim())

  if (!msg) {
    uni.showToast({
      icon: 'none',
      title: '请输入信息',
    })
    return
  }

  await userStore.getUserFriendList()
  if (
    !userStore.userFriendList
      .map((friend) => friend.follow_id)
      .includes(currentFriendUserId.value)
  ) {
    uni.showToast({
      icon: 'none',
      title: '你还未是对方好友',
    })
    return
  }

  const payload = {
    type: 'chat',
    from: userStore.userInfo.user_id,
    to: currentFriendUserId.value,
    message: msg,
    is_share: '0',
  }

  socket.emit('sendMessage', payload)

  if (!chatRecords[currentFriendUserId.value]) {
    chatRecords[currentFriendUserId.value] = []
  }

  chatRecords[currentFriendUserId.value]?.push({
    from: userStore.userInfo.user_id,
    message: msg,
    is_share: '0',
  })
  message.value = ''

  await nextTick()
  uni.pageScrollTo({
    duration: 100,
    scrollTop: 999999999,
  })
}

type MsgType = {
  from: string
  message: string
  is_share: '0' | '1'
}
const chatRecords = reactive<Record<string, MsgType[]>>({})
const unreadCount = reactive<Record<string, any>>({})

socket.on(
  'receiveMessage',
  async ({
    from,
    message,
    is_share,
  }: {
    from: string
    message: string
    is_share: '0' | '1'
  }) => {
    if (!chatRecords[from]) chatRecords[from] = []
    chatRecords[from].push({ from, message, is_share })

    if (currentFriendUserId.value !== from) {
      unreadCount[from] = (unreadCount[from] || 0) + 1
    }

    if (currentFriendUserId.value === from) {
      await markAsReadAPI({
        from,
      })
      unreadCount[from] = 0
    }

    const route = getCurrentRoute()
    if (route !== RouterPath.chat) return
    await nextTick()
    uni.pageScrollTo({
      duration: 100,
      scrollTop: 999999999,
    })
  }
)

const scrollTop = ref(0)
watch(currentFriendUserId, async (friend) => {
  if (!friend) return

  await markAsReadAPI({ from: friend })
  unreadCount[friend] = 0

  await getChatHistory(friend)

  uni.pageScrollTo({
    duration: 0,
    scrollTop: 999999999,
  })
})

function adjustScroll(beforeHeight: number) {
  uni
    .createSelectorQuery()
    .select('.main')
    .boundingClientRect((rect) => {
      const afterHeight = rect?.height || 0
      const diff = afterHeight - beforeHeight

      if (diff > 0) {
        uni.pageScrollTo({
          scrollTop: diff,
          duration: 0,
        })
      }
    })
    .exec()
}

const loadHistoryDebounced = debounce(loadHistory, 100)

onPageScroll((e) => {
  const route = getCurrentRoute()
  if (route !== RouterPath.chat) return
  if (e.scrollTop === 0) return
  if (e.scrollTop <= 100) {
    loadHistoryDebounced()
  }
})

let beforeHeight = 0
function loadHistory() {
  if (!currentFriendUserId.value) return
  if (startIndex.value === 0) return
  uni
    .createSelectorQuery()
    .select('.main')
    .boundingClientRect((rect) => {
      beforeHeight = rect?.height || 0

      const newStart = Math.max(0, startIndex.value - pageSize)
      const more = allList.value.slice(newStart, startIndex.value)

      const mapList = more.map((msg: ChatInfo) => ({
        from: msg.sender,
        message: msg.content,
        is_share: msg.is_share ?? '0',
      }))

      startIndex.value = newStart
      chatRecords[currentFriendUserId.value].unshift(...mapList)

      nextTick(() => {
        adjustScroll(beforeHeight)
      })
    })
    .exec()
}

const allList = ref([])
const renderList = ref([])
const pageSize = 30
const startIndex = ref(0)

async function getChatHistory(friendId: string) {
  const res = await getChatHistoryAPI(friendId)
  const history = res.data.data
  if (!history) return

  allList.value = history

  const len = history.length
  startIndex.value = Math.max(0, len - pageSize)

  renderList.value = history.slice(startIndex.value, len)

  chatRecords[friendId] = renderList.value.map((msg: ChatInfo) => ({
    from: msg.sender,
    message: msg.content,
    is_share: msg.is_share ?? '0',
  }))
}

emitter.on('EVENT:UPDATE_CHAT_RECORDS', async (friend: string) => {
  await getChatHistory(friend)
})

onShow(async () => {
  await userStore.getUserFriendList()
  await fetchUnread()
})

const searchUserList = ref<UserBySearchInfo[]>([])
const showSearchBox = ref(false)

const search = debounce(async (result: string) => {
  if (!result) {
    searchUserList.value = []
    return
  }
  const res = await searchUserAPI(result)
  showSearchBox.value = true
  searchUserList.value = res.data.data
}, 300)

const result = ref('')
watch(result, (val) => {
  if (!result.value) {
    showSearchBox.value = false
  }
  search(val)
})

const navigateToUser = (userId: string) => {
  uni.navigateTo({
    url: `${RouterPath.user}?userId=${userId}`,
  })
}

// #ifdef MP-WEIXIN
import { onShow } from '@dcloudio/uni-app'
import { navigateInterceptor } from '@/utils'

onShow(() => {
  navigateInterceptor()
})
// #endif
</script>

<template>
  <view class="chat-view" :class="{ theme: statusStore.isDarkMode }">
    <view class="left">
      <view class="title">
        <label class="search-item">
          <input
            class="search-input"
            :class="{ 'theme-search-input': statusStore.isDarkMode }"
            v-model="result"
            type="text"
            placeholder="搜索用户"
          />
          <SearchIcon class="search" @click="search(result)" />
        </label>
        <view class="search-list" v-if="showSearchBox && searchUserList.length">
          <view
            class="s-item"
            v-for="user in searchUserList"
            :key="user.user_id"
            @click="navigateToUser(user.user_id)"
          >
            <image
              class="s-img"
              mode="aspectFill"
              :src="getImgUrl(user.user_avatar)"
            />
            <text class="s-text">{{ user.username }}</text>
          </view>
        </view>
        <view
          v-if="showSearchBox && result && searchUserList.length === 0"
          class="search-list"
          :class="{ 'theme-search-list': statusStore.isDarkMode }"
        >
          <text class="s-text">没有找到用户</text>
        </view>
      </view>

      <view class="ul" :class="{ 'ul-show': showChatBox }">
        <view
          v-if="userStore.userFriendList.length !== 0"
          class="li"
          v-for="friend in userStore.userFriendList"
          :key="friend.follow_id"
          @click="
            selectFriend(friend.username, friend.user_avatar, friend.follow_id)
          "
          @keydown.enter="
            selectFriend(friend.username, friend.user_avatar, friend.follow_id)
          "
        >
          <image
            class="u-img"
            mode="aspectFill"
            :src="getImgUrl(friend.user_avatar)"
          />
          <text class="u-text">{{ friend.username }}</text>
          <view
            v-if="unreadCount[friend.follow_id]"
            class="unread-count"
            :class="{ 'theme-unread-count': statusStore.isDarkMode }"
          >
            {{ unreadCount[friend.follow_id] }}
          </view>
        </view>
        <view class="box" v-else>
          <text>你没朋友😶‍🌫️</text>
        </view>
      </view>
    </view>

    <view
      class="right"
      :class="{
        'right-up': showChatBox,
        'theme-right': statusStore.isDarkMode,
      }"
    >
      <view class="chat-box" v-if="currentFriendUsername">
        <view
          class="header"
          :class="{ 'theme-header': statusStore.isDarkMode }"
        >
          <image
            class="h-img"
            mode="aspectFill"
            :src="getImgUrl(currentFriendAvatar)"
          />
          <text>{{ currentFriendUsername }}</text>
          <view class="close-box" @click="closeChatBox">
            <CloseIcon class="close" />
          </view>
        </view>

        <scroll-view class="main" style="flex: 1">
          <view
            class="text"
            v-for="(msg, index) in chatRecords[currentFriendUserId] || []"
            :key="index"
          >
            <view
              class="user-chat div"
              v-if="msg.from === userStore.userInfo.user_id"
            >
              <rich-text
                class="span"
                :class="{ 'theme-span': statusStore.isDarkMode }"
                v-if="msg.is_share === '0'"
                :nodes="lineBreakReplace(msg.message)"
              ></rich-text>
              <view v-else class="post-msg">
                <SharePost :post-id="msg.message" />
              </view>
              <image
                class="m-img"
                mode="aspectFill"
                :src="getImgUrl(userStore.userInfo?.user_avatar)"
              />
            </view>
            <view
              class="follow-chat div"
              v-if="msg.from !== userStore.userInfo.user_id"
            >
              <image
                class="m-img"
                mode="aspectFill"
                :src="getImgUrl(currentFriendAvatar)"
              />
              <rich-text
                class="span"
                :class="{ 'theme-span': statusStore.isDarkMode }"
                v-if="msg.is_share === '0'"
                :nodes="lineBreakReplace(msg.message)"
              ></rich-text>
              <view v-else class="post-msg">
                <SharePost :post-id="msg.message" />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    <view class="footer" v-if="showChatBox">
      <view class="chat-input">
        <textarea
          class="textarea"
          :class="{ 'theme-textarea': statusStore.isDarkMode }"
          v-model.trim="message"
          @keydown.enter="sendMessage($event)"
          placeholder="Please input your message..."
        ></textarea>
        <view
          class="btn"
          :class="{ 'theme-btn': statusStore.isDarkMode }"
          @click="sendMessage($event)"
          title="发送"
        >
          <SendIcon />
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.theme {
  background-color: $theme-dark-color !important;
}

.theme-search-list {
  background-color: $theme-dark-avatar-widget-color !important;
  box-shadow: $theme-dark-shadow-color !important;
}

.theme-search-input {
  background-color: $theme-dark-textarea-bg-color !important;
  color: $theme-dark-font-color !important;
}

.theme-unread-count {
  color: $theme-dark-font-color !important;
  background-color: $theme-dark-chat-speech-bubble-color !important;
}

.theme-right {
  background-color: $theme-dark-color !important;
}

.theme-header {
  background-color: $theme-dark-color !important;
}

.theme-span {
  background-color: $theme-dark-chat-speech-bubble-color !important;
}

.theme-btn {
  background-color: $theme-dark-send-button-color !important;
}

.theme-textarea {
  color: $theme-dark-font-color !important;
  background-color: $theme-dark-color !important;
}

.chat-view {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: $theme-light-color;

  display: flex;
  flex-direction: column;
  position: relative;

  .left {
    padding: 10px;
    height: calc(100vh - var(--window-top) - var(--window-bottom) - 20px);
    position: relative;

    .title {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      .search-list {
        position: absolute;
        top: 60px;
        right: 10px;
        display: flex;
        flex-direction: column;
        width: 120px;
        height: auto;
        border-radius: 10px;
        font-size: 14px;
        padding: 10px;
        background-color: $theme-light-avatar-widget-color;
        box-shadow: $theme-light-shadow-color;

        .s-item {
          display: flex;
          align-items: center;
          gap: 10px;

          .s-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
          }

          .s-img {
            width: 30px;
            height: 30px;
            aspect-ratio: 1;
            object-fit: cover;
            border-radius: 50%;
          }
        }
      }

      .search-item {
        position: relative;
        margin-left: auto;
        cursor: pointer;

        .search-input {
          background-color: $theme-light-textarea-bg-color;
          width: 120px;
          height: 40px;
          padding-left: 10px;
          padding-right: 45px;
          border-radius: 10px;
          color: $theme-light-font-color;
        }

        .search {
          position: absolute;
          right: 8px;
          top: 4px;
          opacity: 0.5;
        }
      }
    }

    .ul-show {
      opacity: 0 !important;
    }

    .ul {
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
      height: calc(100% - 50px);

      .box {
        display: flex;
        height: calc(100vh - var(--window-top) - var(--window-bottom));
        align-items: center;
        justify-content: center;
      }

      .li {
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
          color: $theme-light-font-color;
          border-radius: 50%;
          background-color: $theme-light-chat-speech-bubble-color;
          font-size: 15px;
        }

        .u-img {
          width: 50px;
          height: 50px;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 50%;
        }

        .u-text {
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
      }
    }
  }

  .right {
    width: 100%;
    position: absolute;
    background-color: $theme-light-color;
    top: 0;
    left: 0;
    z-index: -1;
    transform: translateY(100%);
    opacity: 0;
    padding-bottom: calc(var(--window-bottom) + 60px);

    .chat-box {
      display: flex;
      flex-direction: column;
      position: relative;

      .header {
        position: sticky;
        top: var(--window-top);
        background-color: $theme-light-color;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        height: 60px;
        box-shadow: 0 1px 1px rgba(156, 164, 172, 0.3);
        box-sizing: border-box;

        .close-box {
          align-self: flex-end;
          margin-left: auto;
          margin-right: 10px;
        }

        .h-img {
          width: 40px;
          height: 40px;
          aspect-ratio: 1;
          border-radius: 50%;
        }
      }

      .main {
        padding: 0 10px;
        box-sizing: border-box;

        .text {
          font-size: 14px;
          width: 100%;
          word-break: break-all;

          .user-chat {
            justify-content: end;

            .m-img {
              margin-left: 10px;
            }
          }

          .follow-chat {
            .m-img {
              margin-right: 10px;
            }
          }

          .div {
            display: flex;
            margin: 10px 0;

            .span {
              padding: 10px;
              border-radius: 10px;
              background-color: $theme-light-chat-speech-bubble-color;
              max-width: 50%;
            }

            .m-img {
              width: 32px;
              height: 32px;
              aspect-ratio: 1;
              border-radius: 50%;
            }
          }
        }
      }
    }
  }

  .footer {
    position: fixed;
    bottom: var(--window-bottom);
    z-index: 100;
    display: flex;
    width: 100%;
    height: 60px;
    box-sizing: border-box;

    .chat-input {
      display: flex;
      align-items: center;
      width: 100%;
      border-radius: 10px;
      transition: all 0.3s ease;

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 55px;
        height: 60px;
        border: none;
        outline: none;
        padding: 0 10px;
        border-radius: 0 10px 0 0;
        background-color: $theme-light-send-button-color;
        transition: all 0.3s ease;
        box-shadow: 0 -1px 1px rgba(156, 164, 172, 0.3);
      }

      .textarea {
        width: 100%;
        height: 40px;
        resize: none;
        padding: 10px;
        border: none;
        outline: none;
        font-size: 16px;
        color: $theme-light-font-color;
        background-color: $theme-light-color;
        transition: all 0.3s ease;
        border-radius: 10px 0 0 0;
        box-shadow: 0 -1px 1px rgba(156, 164, 172, 0.3);
        font-family: system-ui;
      }
    }
  }

  .right-up {
    z-index: 1;
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
