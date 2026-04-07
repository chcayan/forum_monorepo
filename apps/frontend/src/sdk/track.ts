import { baseURL } from '@/utils'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserEventItem = {
  event: 'post_browse'
  time: number
  page: string
  userId?: string
  data?: any
}

export type ErrorEventItem = {
  event: 'js_error' | 'promise_error' | 'resource_error' | 'vue_error'
  time: number
  userId?: string
  data?: any
}

const userQueue: UserEventItem[] = []
const errorQueue: ErrorEventItem[] = []

const getUserId = () => localStorage.getItem('userId') || 'guest'

export const userTrack = (
  event: UserEventItem['event'],
  page: string,
  data?: any
) => {
  userQueue.push({
    event,
    time: Date.now(),
    page: page || location.pathname,
    userId: getUserId(),
    data,
  })

  scheduleFlush()
}

export const errorTrack = (event: ErrorEventItem['event'], data?: any) => {
  errorQueue.push({
    event,
    time: Date.now(),
    userId: getUserId(),
    data,
  })

  scheduleFlush()
}

const userFlush = () => {
  if (!userQueue.length) return

  const data = userQueue.splice(0)

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

  const success = navigator.sendBeacon(baseURL + '/track/user', blob)

  if (!success) {
    fetch(baseURL + '/track/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    })
  }
}

const errorFlush = () => {
  if (!errorQueue.length) return

  const data = errorQueue.splice(0)

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

  const success = navigator.sendBeacon(baseURL + '/track/error', blob)

  if (!success) {
    fetch(baseURL + '/track/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    })
  }
}

let timer: any = null
const scheduleFlush = () => {
  if (timer) return
  timer = setTimeout(() => {
    userFlush()
    errorFlush()
    timer = null
  }, 5000)
}

window.addEventListener('beforeunload', () => {
  userFlush()
  errorFlush()
})
