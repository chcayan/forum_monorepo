/* eslint-disable @typescript-eslint/no-explicit-any */
export type EventItem = {
  event: 'view_post' | 'comment_post' | 'page_view'
  time: number
  page: string
  userId?: string
  data?: any
}

const queue: EventItem[] = []

let timer: any = null

const getUserId = () => localStorage.getItem('userId') || 'guest'

export const track = (event: EventItem['event'], data?: any) => {
  queue.push({
    event,
    time: Date.now(),
    page: location.pathname,
    userId: getUserId(),
    data,
  })

  scheduleFlush()
}

const flush = () => {
  if (!queue.length) return

  // const data = JSON.stringify(queue.splice(0, queue.length))
  // const data = queue

  const blob = new Blob([JSON.stringify(queue)], { type: 'application/json' })

  console.log(blob)
  navigator.sendBeacon('/api/track/batch', blob)
}

const scheduleFlush = () => {
  if (timer) return
  timer = setTimeout(() => {
    flush()
    timer = null
  }, 5000)
}

window.addEventListener('beforeunload', flush)
