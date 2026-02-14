import { request } from '@/utils'

/**
 * 获取聊天记录 - 数据结构：ChatInfo[]
 * @param followId 好友id
 */
export function getChatHistoryAPI(followId: string) {
  return request.get(`/chat/history/${followId}`)
}

/**
 * 获取未读消息数量 - 数据结构：UnreadInfo[]
 * @returns
 */
export function getChatUnreadAPI() {
  return request.get('/chat/unread')
}

/**
 * 标记为已读
 * @param data from: 好友id
 * @returns
 */
export function markAsReadAPI(data: { followId: string }) {
  return request.post('/chat/mark-as-read', data)
}

export function getAiChatResultAPI(data: { prompt: string }) {
  return request.post('/chat/ai/result', data)
}
