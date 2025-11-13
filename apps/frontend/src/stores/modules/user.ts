import {
  getUserCollectPostIdListAPI,
  getUserFollowsAPI,
  getUserFriendAPI,
  getUserInfoAPI,
} from '@/api'
import type { FriendInfo, UserInfo } from '@forum-monorepo/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')

  const defaultUserInfo = {
    user_id: '',
    username: '',
    user_avatar: '',
    user_email: '',
    registration: '',
    follows: 0,
    fans: 0,
    background_img: '',
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
    localStorage.removeItem('token')
  }

  const getUserInfo = async () => {
    const res = await getUserInfoAPI()
    userInfo.value = res.data.data[0]
  }

  const userCollectListOfPostId = ref<string[]>([])

  const getUserCollectListOfPostId = async () => {
    const res = await getUserCollectPostIdListAPI({
      creatorUserId: userInfo.value.user_id as string,
    })
    const arr = res.data?.data ?? []
    userCollectListOfPostId.value = arr.map(
      (item: { p_id: string }) => item.p_id
    )
  }

  const userFollowList = ref<FriendInfo[]>([])
  const userFollowIdList = ref<string[]>([])

  const getUserFollowList = async (userId?: string) => {
    const res = await getUserFollowsAPI(userId || userInfo.value.user_id)
    const list = res.data.data as FriendInfo[]
    userFollowIdList.value = list.map((user) => user.follow_id)
  }

  const userFriendList = ref<FriendInfo[]>([])
  const getUserFriendList = async () => {
    const res = await getUserFriendAPI()
    userFriendList.value = res.data.data
    console.log(res.data.data)
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
  }
})
