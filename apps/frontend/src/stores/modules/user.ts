import { getUserInfoAPI } from '@/api'
import { UserInfo } from '@forum-monorepo/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>()
    const userInfo = ref<UserInfo>()

    const setToken = (_token: string) => {
      token.value = _token
    }
    const removeToken = () => {
      token.value = ''
      // userInfo.value = {
      //   user_avatar: '',
      //   user_email: '',
      //   user_id: '',
      //   username: '',
      //   registration: '',
      //   fans: 0,
      //   follows: 0,
      //   background_img: '',
      //   sex: '',
      //   signature: '',
      // }
    }

    const getUserInfo = async () => {
      const res = await getUserInfoAPI()
      userInfo.value = res.data.data[0]
    }

    return {
      token,
      setToken,
      removeToken,
      userInfo,
      getUserInfo,
    }
  },
  {
    persist: true,
  }
)
