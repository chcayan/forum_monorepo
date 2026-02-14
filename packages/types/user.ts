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
  user_avatar: string
  userId: string
}
