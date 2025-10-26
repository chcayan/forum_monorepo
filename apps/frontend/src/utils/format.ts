/**
 * 将字符串中的 HTML 特殊字符转义
 * @param str 字符串
 * @returns
 */
export function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
