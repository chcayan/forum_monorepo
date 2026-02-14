import {
  getUserCollectPostIdListAPI,
  getUserFollowsAPI,
  getUserFriendAPI,
  getUserInfoAPI,
} from '@/api'
import { RouterPath } from '@/router'
import type { FriendInfo, UserInfo } from '@forum-monorepo/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')

  const CN_VERSION = ref(import.meta.env.VITE_CN_VERSION || 'disabled')

  const route = useRoute()
  let timer: number | undefined
  const setCN_VERSION = (status: 'disabled' | 'enabled') => {
    if (import.meta.env.VITE_CN_VERSION === 'disabled' || token.value) {
      return
    }
    CN_VERSION.value = status
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      if (!route.path.startsWith(RouterPath.login)) {
        CN_VERSION.value = 'enabled'
      }
    }, 5000)
  }

  const defaultUserInfo = {
    userId: '',
    username: '',
    userAvatar: '',
    userEmail: '',
    registration: '',
    follows: '',
    fans: '',
    backgroundImg: '',
    sex: '',
    signature: '',
  }
  const userInfo = ref<UserInfo>(defaultUserInfo)

  const setToken = (_token: string) => {
    token.value = _token
    localStorage.setItem('token', token.value)
  }
  const removeToken = () => {
    token.value = ''
    userInfo.value = defaultUserInfo
    userCollectListOfPostId.value = []
    userFollowList.value = []
    userFollowIdList.value = []
    userFriendList.value = []
    localStorage.removeItem('token')
  }

  const getUserInfo = async () => {
    const res = await getUserInfoAPI('self')
    userInfo.value = res.data.data
  }

  const userCollectListOfPostId = ref<string[]>([])

  const getUserCollectListOfPostId = async () => {
    const res = await getUserCollectPostIdListAPI()
    const arr = res.data?.data ?? []
    userCollectListOfPostId.value = arr.map(
      (item: { p_id: string }) => item.p_id
    )
  }

  const userFollowList = ref<FriendInfo[]>([])
  const userFollowIdList = ref<string[]>([])

  const getUserFollowList = async (userId?: string) => {
    const res = await getUserFollowsAPI(userId || userInfo.value.userId)
    const list = res.data.data as FriendInfo[]
    userFollowIdList.value = list.map((user) => user.followId)
  }

  const userFriendList = ref<FriendInfo[]>([])
  const getUserFriendList = async () => {
    const res = await getUserFriendAPI()
    userFriendList.value = res.data.data
  }

  return {
    token,
    setToken,
    removeToken,
    userInfo,
    getUserInfo,
    userCollectListOfPostId,
    getUserCollectListOfPostId,
    userFollowList,
    userFollowIdList,
    getUserFollowList,
    userFriendList,
    getUserFriendList,
    CN_VERSION,
    setCN_VERSION,
  }
})
