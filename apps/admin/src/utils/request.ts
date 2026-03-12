import axios from 'axios'
import emitter from './eventEmitter'
import { useUserStore } from '@/stores'
import { refreshAPI } from '@/api'

const baseURL = '/api'

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
    const token = useUserStore.getState().token
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
    const setToken = useUserStore.getState().setToken

    if (err.response?.status === 400) {
      emitter.emit('API:BAD_REQUEST', err.response?.data.message)
    }
    if (err.response?.status === 401) {
      if (originalRequest.url?.includes('/admin/login')) {
        emitter.emit('API:UN_AUTH', err.response?.data.message)
        return Promise.reject(err)
      }

      // if (originalRequest.url?.includes('/auth/refresh-admin')) {
      //   emitter.emit('API:UN_AUTH', err.response?.data.message)
      //   return Promise.reject(err)
      // }

      // if (!isRefreshing) {
      //   isRefreshing = true

      //   try {
      //     const res = await refreshAPI()
      //     const newToken = res.data.data.accessToken

      //     setToken(newToken)
      //     onRefreshed(newToken)
      //   } catch {
      //     emitter.emit('API:UN_AUTH', err.response?.data.message)
      //     return Promise.reject(err)
      //   } finally {
      //     isRefreshing = false
      //   }
      // }

      // return new Promise((resolve) => {
      //   subscribeTokenRefresh((token) => {
      //     originalRequest.headers.Authorization = `Bearer ${token}`
      //     // getUserInfo()
      //     resolve(instance(originalRequest))
      //   })
      // })
      if (!isRefreshing) {
        isRefreshing = true

        try {
          const res = await refreshAPI()
          const newToken = res.data.data.accessToken

          setToken(newToken)
          onRefreshed(newToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return instance(originalRequest)
        } catch {
          emitter.emit('API:UN_AUTH', err.response?.data.message)
          return Promise.reject(err)
        } finally {
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
