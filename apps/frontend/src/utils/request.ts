import axios from 'axios'
import emitter from './eventEmitter'
import { useUserStore } from '@/stores'

const baseURL = '/api'

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

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
  (err) => {
    if (err.response?.status === 401) {
      emitter.emit('API:UN_AUTH', err.response?.data.message)
    }
    if (err.response?.status === 400) {
      emitter.emit('API:BAD_REQUEST', err.response?.data.message)
    }
    if (err.response?.status) return Promise.reject(err)
  }
)

export { instance as request }
