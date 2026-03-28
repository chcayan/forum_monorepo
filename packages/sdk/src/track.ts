/* eslint-disable @typescript-eslint/no-explicit-any */
export type EventItem = {
  event: 'post_browse'
  time: number
  page: string
  userId?: string
  data?: any
}

const queue: EventItem[] = []

let timer: any = null

const getUserId = () => localStorage.getItem('userId') || 'guest'

export const track = (event: EventItem['event'], page: string, data?: any) => {
  queue.push({
    event,
    time: Date.now(),
    page: page || location.pathname,
    userId: getUserId(),
    data,
  })

  scheduleFlush()
}

const flush = () => {
  if (!queue.length) return

  const data = queue.splice(0)

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

  const success = navigator.sendBeacon('/api/track/batch', blob)

  if (!success) {
    fetch('/api/track/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    })
  }
}

const scheduleFlush = () => {
  if (timer) return
  timer = setTimeout(() => {
    flush()
    timer = null
  }, 5000)
}

window.addEventListener('beforeunload', flush)
