import { defineStore } from 'pinia'
import { ref } from 'vue'
import emitter from '@/utils/eventEmitter'

emitter.on('API:UN_AUTH', () => {
  useUserStore().removeToken()
})

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>()

    const setToken = (_token: string) => {
      token.value = _token
    }

    const removeToken = () => {
      token.value = ''
    }

    return {
      token,
      setToken,
      removeToken,
    }
  },
  {
    persist: true,
  }
)
