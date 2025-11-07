import { request } from '@/utils'

/**
 * 用户信息 - 数据结构：UserInfo[]
 * @param data 用户id
 * @returns
 */
export function getUserInfoAPI(data: { userId?: string } = {}) {
  return request.post('/user/info', data)
}

/**
 * 查询用户帖子 - 数据结构：PostDetail[]
 * @param data 用户id
 * @returns
 */
export function getUserPostAPI(data: {
  creatorUserId: string
  page: number
  limit: number
}) {
  return request.post('/user/posts', data)
}

type UserInfo = {
  username: string
  sex: string
  signature: string
  avatar?: File | null
  bgImg?: File | null
}

/**
 * 用户信息更新
 * @param data 用户姓名、性别、个人介绍、头像、背景图片
 * @returns
 */
export function updateUserInfoAPI(data: UserInfo) {
  const formData = new FormData()
  formData.append('username', data.username)
  formData.append('sex', data.sex)
  formData.append('signature', data.signature)
  if (data.avatar) {
    formData.append('avatar', data.avatar)
  }
  if (data.bgImg) {
    formData.append('bgImg', data.bgImg)
  }

  return request.post('/user/update', formData)
}

type PostInfo = {
  creatorUserId: string
  page: number
  limit: number
}

/**
 * 用户收藏帖子信息
 * @param data 用户id、页数、每页帖子数
 * @returns
 */
export function getUserCollectPostAPI(data: PostInfo) {
  return request.post('/user/collect', data)
}

/**
 * 用户收藏帖子p_id数组
 * @param data 用户id
 * @returns
 */
export function getUserCollectPostIdListAPI(data: { creatorUserId: string }) {
  return request.post('/user/collect/postId', data)
}

/**
 * 用户添加收藏
 * @param data 帖子id
 * @returns
 */
export function updateUserAddCollectAPI(data: { postId: string }) {
  return request.post('/user/collect/add', data)
}

/**
 * 用户取消收藏
 * @param data 帖子id
 * @returns
 */
export function updateUserDelCollectAPI(data: { postId: string }) {
  return request.delete('/user/collect/del', { data })
}

/**
 * 用户删除帖子
 * @param data 帖子id
 * @returns
 */
export function deleteUserPostAPI(data: { postId: string }) {
  return request.delete('/user/post/del', { data })
}

/**
 * 用户设置帖子公开
 * @param data 帖子id
 * @returns
 */
export function updateUserPostToPublicAPI(data: { postId: string }) {
  return request.patch('/user/post/public', data)
}

/**
 * 用户设置帖子非公开
 * @param data 帖子id
 * @returns
 */
export function updateUserPostToPrivateAPI(data: { postId: string }) {
  return request.patch('/user/post/private', data)
}

/**
 * 用户好友 - 数据结构：FriendInfo[]
 * @returns
 */
export function getUserFriendAPI() {
  return request.get('/user/friend')
}

/**
 * 用户添加关注
 * @param data 关注者id
 * @returns
 */
export function updateUserAddFollowAPI(data: { followId: string }) {
  return request.post('/user/follow/add', data)
}

/**
 * 用户取消关注
 * @param data 关注者id
 * @returns
 */
export function updateUserDelFollowAPI(data: { followId: string }) {
  return request.delete('/user/follow/del', { data })
}

/**
 * 搜索用户 - 数据结构：UserBySearchInfo[]
 * @param username 用户名
 * @returns
 */
export function searchUserAPI(username: string) {
  return request.get(`/user/search?username=${username}`)
}

/**
 * 用户关注 - 数据结构：FriendInfo[]
 * @param userId 用户id
 * @returns
 */
export function getUserFollowsAPI(userId: string) {
  return request.get(`/user/follows?userId=${userId}`)
}

/**
 * 用户粉丝 - 数据结构：FriendInfo[]
 * @param userId 用户id
 * @returns
 */
export function getUserFansAPI(userId: string) {
  return request.get(`/user/fans?userId=${userId}`)
}
