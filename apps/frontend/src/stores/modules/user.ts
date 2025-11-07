import { getUserInfoAPI } from '@/api'
import { UserInfo } from '@forum-monorepo/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>()
    const userInfo = ref<UserInfo>({
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
    })

    const setToken = (_token: string) => {
      token.value = _token
    }
    const removeToken = () => {
      token.value = ''
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
