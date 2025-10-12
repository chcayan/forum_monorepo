// 用户信息
export interface UserInfo {
  user_id: string
  username: string
  user_avatar: string
  user_email: string
  registration: string
  follows: number
  fans: number
  background_img: string
  sex: string
  signature: string
}

// 好友信息
export interface FriendInfo {
  user_id: string
  follow_id: string
  username: string
  user_avatar: string
}

// 搜索用户信息
export interface UserBySearchInfo {
  username: string
  user_avatar: string
  user_id: string
}
