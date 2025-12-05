import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTempStore = defineStore('temp', () => {
  const tempComment = ref('')
  const setTempComment = (comment: string) => {
    tempComment.value = comment
  }
  const removeTempComment = () => {
    tempComment.value = ''
  }

  type UserInfo = {
    userId: string
    username: string
    userAvatar: string
  }

  const defaultTempUserInfo: UserInfo = {
    userId: '',
    username: '',
    userAvatar: '',
  }

  const tempUserInfo = ref<UserInfo>(defaultTempUserInfo)

  const setTempUserInfo = (userInfo: UserInfo) => {
    tempUserInfo.value = userInfo
  }

  const removeTempUserInfo = () => {
    tempUserInfo.value = defaultTempUserInfo
  }

  return {
    tempComment,
    setTempComment,
    removeTempComment,
    tempUserInfo,
    setTempUserInfo,
    removeTempUserInfo,
  }
})
