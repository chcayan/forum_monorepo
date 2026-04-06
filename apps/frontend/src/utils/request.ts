import axios from 'axios'
import emitter from './eventEmitter'
import { useUserStore } from '@/stores'
import { refreshAPI } from '@/api'

const baseURL =
  import.meta.env.VITE_IS_ELECTRON === 'true'
    ? import.meta.env.VITE_REQUEST_URL
    : '/api'

const instance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

instance.interceptors.response.use(
  (res) => {
    return res
  },
  async (err) => {
    const originalRequest = err.config
    const userStore = useUserStore()

    if (err.response?.status === 400) {
      emitter.emit('API:BAD_REQUEST', err.response?.data.message)
    }
    if (err.response?.status === 401) {
      if (originalRequest.url?.includes('/user/login')) {
        emitter.emit('API:UN_AUTH', err.response?.data.message)
        return Promise.reject(err)
      }

      if (!isRefreshing) {
        isRefreshing = true

        try {
          const res = await refreshAPI()
          const newToken = res.data.data.accessToken
          console.log(document.cookie)
          userStore.setToken(newToken)
          onRefreshed(newToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return instance(originalRequest)
        } catch (error) {
          console.log(error)
          console.log('err')
          emitter.emit('API:UN_AUTH', err.response?.data.message)
          return Promise.reject(err)
        } finally {
          console.log('refresh')
          isRefreshing = false
        }
      } else {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(instance(originalRequest))
          })
        })
      }
    }
    if (err.response?.status === 403) {
      emitter.emit('API:FORBIDDEN', err.response?.data.message)
    }
    if (err.response?.status) return Promise.reject(err)
  }
)

export { instance as request }
