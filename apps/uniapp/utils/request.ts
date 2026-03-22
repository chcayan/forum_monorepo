import { refreshAPI } from '../api'
import { useUserStore } from '../stores'
import emitter from './eventEmitter'

type Options = {
  baseUrl: string
  url: string
  data?: any
  header?: any
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'
  timeout?: number
  beforeRequest?: (requestInstance: Request) => Request
  afterRequest?: (res: any) => void
  withCredentials?: boolean
}

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

class Request {
  baseUrl: string = ''
  url: string = ''
  data?: any
  header?: any
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'
  timeout?: number
  beforeRequest?: (requestInstance: Request) => Request
  afterRequest?: (res: any) => void
  withCredentials?: boolean

  constructor(options: Options) {
    this.baseUrl = options.baseUrl
    this.url = options.url
    this.data = {}
    this.header = options.header || {}
    this.method = 'GET'
    this.timeout = options.timeout || 60000
    this.beforeRequest = undefined
    this.afterRequest = undefined
    this.withCredentials = false
  }

  get(url: string, data: any | string = {}) {
    this.method = 'GET'
    this.url = this.baseUrl + url
    this.data = data
    return this.handleRequest()
  }

  post(url: string, data: any | string = {}) {
    this.method = 'POST'
    this.url = this.baseUrl + url
    this.data = data
    return this.handleRequest()
  }

  put(url: string, data: any | string = {}) {
    this.method = 'PUT'
    this.url = this.baseUrl + url
    this.data = data
    return this.handleRequest()
  }

  delete(url: string, data: any | string = {}) {
    this.method = 'DELETE'
    this.url = this.baseUrl + url
    this.data = data
    return this.handleRequest()
  }

  patch(url: string, data: any | string = {}) {
    this.method = 'PATCH'
    this.url = this.baseUrl + url
    this.data = data

    return this.handleRequest()
  }

  handleRequest() {
    const originalRequest = this.beforeRequest?.(this)
    const userStore = useUserStore()
    return new Promise<any>(
      (resolve: (v: any) => void, reject: (r: any) => void) => {
        uni.request({
          url: this.url,
          method: this.method,
          data: this.data,
          header: this.header,
          timeout: this.timeout,
          withCredentials: this.withCredentials,
          success: async (res: any) => {
            if (res.statusCode === 400) {
              emitter.emit('API:BAD_REQUEST', res.data.message)
              reject(res)
              return
            } else if (res.statusCode === 401) {
              if (originalRequest?.url?.includes('/user/login')) {
                emitter.emit('API:UN_AUTH', res.data.message)
                return reject(res)
              }

              if (!isRefreshing) {
                isRefreshing = true
                try {
                  const res = await refreshAPI()
                  const newToken = res.data.data.accessToken

                  userStore.setToken(newToken)
                  onRefreshed(newToken)

                  return new Request({
                    baseUrl,
                    url: originalRequest!.url,
                    header: {
                      Authorization: `Bearer ${newToken}`,
                    },
                    withCredentials: true,
                  })
                } catch {
                  emitter.emit('API:UN_AUTH', res.data.message)
                  return reject(res)
                } finally {
                  isRefreshing = false
                }
              } else {
                return new Promise((resolve) => {
                  subscribeTokenRefresh((token) => {
                    resolve(
                      new Request({
                        baseUrl,
                        url: originalRequest!.url,
                        header: {
                          Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                      }) as unknown as void
                    )
                  })
                })
              }
            } else if (res.statusCode === 403) {
              emitter.emit('API:FORBIDDEN', res.data.message)
              reject(res)
            }
            resolve(res)
          },
          fail: (err: any) => {
            reject(err)
          },
        })
      }
    )
  }
}

const socketUrl = import.meta.env.VITE_SOCKET
const baseUrl = import.meta.env.VITE_BASE_URL
const request = new Request({
  baseUrl,
  url: '',
  withCredentials: true,
})

request.beforeRequest = function (requestInstance: Request) {
  const userStore = useUserStore()
  const token = userStore.token

  requestInstance.header = requestInstance.header || {}

  if (token) {
    requestInstance.header['Authorization'] = `Bearer ${token}`
  }
  return requestInstance
}

export { baseUrl, request, socketUrl }
