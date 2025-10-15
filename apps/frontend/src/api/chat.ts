import { request } from '@/utils'

/**
 * 获取聊天记录 - 数据结构：ChatInfo[]
 * @param followId 好友id
 */
export function getChatHistoryAPI(followId: string) {
  return request.get(`/chat/history?followId=${followId}`)
}

/**
 * 获取未读消息数量 - 数据结构：UnreadInfo[]
 * @param followId 好友id
 * @returns
 */
export function getChatUnreadAPI(followId: string) {
  return request.get(`/chat/unread/${followId}`)
}

/**
 * 标记为已读
 * @param data from: 好友id
 * @returns
 */
export function markAsReadAPI(data: { from: string }) {
  return request.post('/chat/mark-as-read', data)
}
