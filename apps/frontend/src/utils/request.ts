import router from '@/router'
import axios from 'axios'

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
    const token = localStorage.getItem('token')
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
      console.log('请重新登录')
      localStorage.removeItem('token')
    }
    if (err.response?.status === 404) {
      console.log('404 not found')
      router.push('/notfound')
    }
    return Promise.reject(err)
  }
)

export { instance as request }
