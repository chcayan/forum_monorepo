/**
 * 格式化时间 - YYYY-MM-DD_HH:MM:SS
 * @param dateString Date
 * @returns 字符串 '2025-10-12_13-57-23'
 */
export function formatDate(dateString: Date | string) {
  const date = new Date(dateString)

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const year = date.getFullYear()
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

/**
 * 格式化时间 根据年份是否显示年份信息
 * @param dateString Date
 * @returns
 */
export function formatDateByYear(dateString: Date | string) {
  const date = new Date(dateString)
  const now = new Date()

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  if (date.getFullYear() === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}:${seconds}`
  } else {
    const year = date.getFullYear()
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

export function formatTimeAgo(time: string | number | Date) {
  const date = new Date(time).getTime()
  const now = Date.now()
  const diff = Math.floor((now - date) / 1000) // 秒

  if (diff < 60) return '刚刚'

  const minute = 60
  const hour = 60 * minute
  const day = 24 * hour
  const year = 365 * day

  if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  }

  if (diff < day * 2) {
    return '昨天'
  }

  if (diff < year) {
    return `${Math.floor(diff / day)}天前`
  }

  return `${Math.floor(diff / year)}年前`
}
