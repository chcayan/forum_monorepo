<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { ChatToast, createEs, socket, Toast } from './utils'
import emitter from '@/utils/eventEmitter'
import { useUserStore, useStatusStore } from './stores'
import router, { RouterPath } from './router'
import { useRoute } from 'vue-router'
import { checkIsLoginProhibitAPI, getUserInfoAPI } from './api'
import { MsgType } from '@forum-monorepo/types'

const userStore = useUserStore()
const route = useRoute()

type userInfo = {
  userId: string
  username: string
  userAvatar: string
}

async function notify({
  from,
  message,
  isShare,
}: {
  from: string
  message: string
  isShare: '0' | '1'
}) {
  const res = await getUserInfoAPI(from)
  const userInfo = res.data?.data as userInfo

  if (import.meta.env.VITE_IS_ELECTRON === 'true') {
    window.electronAPI.notify({
      type: 'chat',
      title: `来自 ${userInfo.username} 的消息：`,
      body: isShare === '0' ? message : '# 分享了一条帖子',
    })
  }

  if (route.path.startsWith(RouterPath.chat)) return
  ChatToast.show({
    userId: userInfo.userId,
    userAvatar: userInfo.userAvatar,
    username: userInfo.username,
    message,
    isShare,
  })
}

let es: EventSource | null
function createEsInstance() {
  if (es) es.close()
  es = createEs(userStore.userInfo.userId)

  es.onmessage = (e) => {
    const { data }: { data: MsgType } = JSON.parse(e.data)
    if (data.type === 'comment') {
      Toast.show({
        msg: data.message,
        type: 'normal',
        duration: 5000,
        eventFn() {
          router.push(`${RouterPath.post}/${data.postId}`)
          if (route.fullPath === `${RouterPath.post}/${data.postId}`) {
            emitter.emit('EVENT:GET_NEW_COMMENT')
          }
        },
        confirmText: '去看看',
      })
    }
  }
}

async function initUserStatus() {
  await checkIsLoginProhibitAPI()
  await userStore.getUserInfo()

  // SSE
  createEsInstance()

  // websocket
  socket.emit('login', userStore.userInfo?.userId)

  socket.off('receiveOnlineList')
  socket.on('receiveOnlineList', (list: string[]) => {
    userStore.setOnLineList(list)
  })

  socket.off('receiveMessage', notify)
  socket.on('receiveMessage', notify)

  await userStore.getUserCollectListOfPostId()
  await userStore.getUserFollowList()
  await userStore.getUserFriendList()
}

watch(
  () => userStore.token,
  async () => {
    if (!userStore.token) return
    await initUserStatus()
  }
)

// api
emitter.on('API:UN_AUTH', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
  userStore.removeToken()

  if (
    route.path.startsWith(RouterPath.chat) ||
    route.path.startsWith(RouterPath.publish) ||
    route.path.startsWith(RouterPath.my)
  ) {
    router.push(RouterPath.base)
  }
})

emitter.on('API:FORBIDDEN', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
})

emitter.on('API:NOT_FOUND', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
})

emitter.on('API:BAD_REQUEST', (message: string) => {
  Toast.show({
    msg: message,
    type: 'error',
  })
})

const statusStore = useStatusStore()
onMounted(async () => {
  // 主题
  document.body.dataset.theme = statusStore.currentTheme

  if (userStore.token) {
    await initUserStatus()
  }

  window.addEventListener('offline', () => {
    Toast.show({
      msg: '不知道谁的网络出现了点问题😢',
      type: 'error',
    })
  })

  window.addEventListener('online', () => {
    Toast.show({
      msg: '满血复活😊',
      type: 'success',
    })
  })

  // electron: 禁止拖动 a 标签
  if (import.meta.env.VITE_IS_ELECTRON === 'true') {
    window.addEventListener('dragstart', (e) => {
      const target = e.target as HTMLElement | null
      if (target) {
        if (target.tagName === 'A') {
          e.preventDefault()
        }
      }
    })
  }

  let lastTime = 0
  window.addEventListener('scroll', () => {
    const now = Date.now()
    if (now - lastTime > 500) {
      emitter.emit('TAB:CLOSE_AVATAR_WIDGET')
      lastTime = now
    }
  })
})
</script>

<template>
  <router-view />
</template>

<style scoped lang="scss"></style>
