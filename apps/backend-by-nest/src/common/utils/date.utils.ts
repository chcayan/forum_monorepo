/**
 * 格式化时间 - YYYY-MM-DD_HH:MM:SS
 * @param dateString Date
 * @returns 字符串 '2025-10-12_13-57-23'
 */
export function formatDate(dateString: Date | string) {
  const date = new Date(dateString);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const year = date.getFullYear();
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

export function formatRemainTime(targetTime: Date | string | number) {
  const diff = new Date(targetTime).getTime() - Date.now();

  if (diff <= 0) return '0 分钟';

  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hour = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minute = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let result = '';

  if (day > 0) result += ` ${day} 天`;
  if (hour > 0) result += ` ${hour} 小时`;
  if (minute > 0) result += ` ${minute} 分钟`;

  return result;
}
