// 用户信息
export interface UserInfo {
  userId: string
  username: string
  userAvatar: string
  userEmail: string
  registration: string
  follows: string
  fans: string
  backgroundImg: string
  sex: string
  signature: string
}

// 好友信息
export interface FriendInfo {
  userId: string
  followId: string
  username: string
  userAvatar: string
}

// 搜索用户信息
export interface UserBySearchInfo {
  username: string
  userAvatar: string
  userId: string
}

// 用户消息
export interface UserMessage {
  id: number
  postId: string
  userId: string
  operatorId: string
  content: string
  status:
    | 'post_review_pass'
    | 'post_review_violate'
    | 'post_violate'
    | 'comment_violate'
    | 'user_mute'
    | 'user_post_prohibit'
    | 'user_login_prohibit'
    | 'system_announcement'
  createdAt: Date
  punishTime: number
  pContent: string
  cContent: string
}
