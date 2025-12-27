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

  constructor(options: Options) {
    this.baseUrl = options.baseUrl
    this.url = options.url
    this.data = {}
    this.header = options.header || {}
    this.method = 'GET'
    this.timeout = options.timeout || 60000
    this.beforeRequest = undefined
    this.afterRequest = undefined
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
    this.beforeRequest?.(this)

    return new Promise<any>(
      (resolve: (v: any) => void, reject: (r: any) => void) => {
        uni.request({
          url: this.url,
          method: this.method,
          data: this.data,
          header: this.header,
          timeout: this.timeout,
          success: (res: any) => {
            if (res.statusCode === 401) {
              console.log(555)
              emitter.emit('API:UN_AUTH', res.data.message)
              reject(res)
              return
            } else if (res.statusCode === 400) {
              emitter.emit('API:BAD_REQUEST', res.data.message)
              reject(res)
              return
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

const socketUrl = 'wss://chcaya.site'
const baseUrl = 'https://chcaya.site/api'
// const socketUrl = 'ws://localhost:3000'
// const baseUrl = 'http://localhost:3000'
// const baseUrl = 'http://10.0.2.2:3000'
const request = new Request({
  baseUrl,
  url: '',
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
