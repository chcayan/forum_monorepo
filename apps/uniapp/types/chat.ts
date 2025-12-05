// 聊天记录信息
export interface ChatInfo {
  msg_id: number
  sender: string
  receiver: string
  content: string
  created_at: string
  is_read: number
  is_share: '0' | '1'
}

// 未读信息
export interface UnreadInfo {
  sender: string
  count: number
}

// ai聊天
export interface AiChatInfo {
  finish_reason: string
  index: number
  message: {
    content: string
    role: string
  }
}
