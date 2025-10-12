/**
 * 格式化时间 - YYYY-MM-DD_HH:MM:SS
 * @param dateString Date
 * @returns 字符串 '2025-10-12_13:57:23'
 */
export function formatDate(dateString: Date) {
  const date = new Date(dateString)

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const year = date.getFullYear()
  return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`
}
