import { useUserStore } from '../stores'

type Options = {
  baseUrl: string
  url: string
  data?: any
  header?: any
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'
  timeout?: number
  beforeRequest?: (requestInstance: Request) => void
  afterRequest?: (res: any) => void
}

class Request {
  baseUrl: string = ''
  url: string = ''
  data?: any
  header?: any
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'
  timeout?: number
  beforeRequest?: (requestInstance: Request) => void
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
            resolve(res)
          },
          fail: (err: any) => {
            reject(err)
          },
          complete: (res: any) => {
            this.afterRequest?.(res)
          },
        })
      }
    )
  }
}

const baseUrl = 'https://chcaya.site/api'
// const baseUrl = 'http://localhost:3000'
// const baseUrl = 'http://10.0.2.2:3000'
const request = new Request({
  // baseUrl: 'http://localhost:3000',
  // baseUrl: 'http://10.0.2.2:3000',
  baseUrl,
  url: '',
})

request.beforeRequest = function (requestInstance: Request) {
  const userStore = useUserStore()
  const token = userStore.token
  if (token) {
    requestInstance.header['Authorization'] = `Bearer ${token}`
  }
  console.log(requestInstance.header)
  return requestInstance
}

request.afterRequest = function (res: any) {
  // console.log(res)
}

export { baseUrl, request }
