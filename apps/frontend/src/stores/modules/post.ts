import { getUserInfoAPI } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@forum-monorepo/types'

export const usePostStore = defineStore('post', () => {
  const userInfo = ref<UserInfo>({
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
  })

  const getUserInfo = async (userId: string) => {
    userInfo.value = {
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
    const res = await getUserInfoAPI(userId)
    userInfo.value = res.data.data[0]
  }

  const getUserInfoWithFans = async (userId: string) => {
    const res = await getUserInfoAPI(userId)
    userInfo.value = res.data.data[0]
  }

  return {
    userInfo,
    getUserInfo,
    getUserInfoWithFans,
  }
})
