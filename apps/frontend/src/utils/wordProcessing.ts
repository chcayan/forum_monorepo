/**
 * 将\n替换成<br />
 * @param content 文本
 * @returns
 */
export function lineBreakReplace(content: string) {
  if (!content) return
  return content.replace(/ /g, '&nbsp;').replace(/\n/g, '<br />')
}
