// 聊天记录信息
export interface ChatInfo {
  msgId: number
  sender: string
  receiver: string
  content: string
  createdAt: string
  isRead: number
  isShare: '0' | '1'
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
