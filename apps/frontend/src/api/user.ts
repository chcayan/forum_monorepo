import { request } from '@/utils'

/**
 * 用户信息 (登录用户填写 'self') - 数据结构：UserInfo[]
 * @param userId 用户id
 * @returns
 */
export function getUserInfoAPI(userId: string) {
  return request.get(`/user/${userId}`)
}

type PostInfo = {
  userId: string
  page: number
  limit: number
}

/**
 * 查询用户帖子 - 数据结构：PostDetail[]
 * @param data 用户id、页数、每页帖子数
 * @returns
 */
export function getUserPostAPI(data: PostInfo) {
  const { userId, page, limit } = data
  return request.get(`/user/post/${userId}?page=${page}&limit=${limit}`)
}

/**
 * 用户收藏帖子信息 - 数据结构：PostDetail[]
 * @param data 用户id、页数、每页帖子数
 * @returns
 */
export function getUserCollectPostAPI(data: PostInfo) {
  const { userId, page, limit } = data
  return request.get(`/user/collect/${userId}?page=${page}&limit=${limit}`)
}

/**
 * 用户收藏帖子p_id数组
 * @returns
 */
export function getUserCollectPostIdListAPI() {
  return request.get('/user/collect/ids')
}

/**
 * 搜索用户 - 数据结构：UserBySearchInfo[]
 * @param username 用户名
 * @returns
 */
export function searchUserAPI(keyword: string) {
  return request.get(`/user/search?keyword=${keyword}`)
}

/**
 * 用户好友 - 数据结构：FriendInfo[]
 * @returns
 */
export function getUserFriendAPI() {
  return request.get('/user/friend')
}

/**
 * 用户关注 - 数据结构：FriendInfo[]
 * @param userId 用户id
 * @returns
 */
export function getUserFollowsAPI(userId: string) {
  return request.get(`/user/follows/${userId}`)
}

/**
 * 用户粉丝 - 数据结构：FriendInfo[]
 * @param userId 用户id
 * @returns
 */
export function getUserFansAPI(userId: string) {
  return request.get(`/user/fans/${userId}`)
}

type UserLogin = {
  email: string
  password: string
}

/**
 * 登录
 * @param data 用户邮箱、密码
 * @returns
 */
export function loginAPI(data: UserLogin) {
  return request.post('/user/login', data)
}

/**
 * 注册
 * @param data 用户邮箱、密码
 * @returns
 */
export function registerAPI(data: UserLogin) {
  return request.post('/user/register', data)
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

  return request.post('/user', formData)
}

/**
 * 用户添加收藏
 * @param postId 帖子id
 * @returns
 */
export function updateUserAddCollectAPI(postId: string) {
  return request.post(`/user/collect/${postId}`)
}

/**
 * 用户添加关注
 * @param followId 关注者id
 * @returns
 */
export function updateUserAddFollowAPI(followId: string) {
  return request.post(`/user/collect/${followId}`)
}

/**
 * 用户取消关注
 * @param followId 关注者id
 * @returns
 */
export function updateUserDelFollowAPI(followId: string) {
  return request.delete(`/user/collect/${followId}`)
}

/**
 * 用户取消收藏
 * @param postId 帖子id
 * @returns
 */
export function updateUserDelCollectAPI(postId: string) {
  return request.delete(`/user/collect/${postId}`)
}

/**
 * 用户删除帖子
 * @param postId 帖子id
 * @returns
 */
export function deleteUserPostAPI(postId: string) {
  return request.delete(`/user/collect/${postId}`)
}

/**
 * 用户设置帖子公开
 * @param postId 帖子id
 * @returns
 */
export function updateUserPostToPublicAPI(postId: string) {
  return request.patch(`/user/post/public/${postId}`)
}

/**
 * 用户设置帖子非公开
 * @param postId 帖子id
 * @returns
 */
export function updateUserPostToPrivateAPI(postId: string) {
  return request.patch(`/user/post/private/${postId}`)
}
