// 聊天记录信息
export interface ChatInfo {
  msg_id: number
  sender: string
  receiver: string
  content: string
  created_at: string
  is_read: number
}

// 未读信息
export interface UnreadInfo {
  sender: string
  count: number
}
