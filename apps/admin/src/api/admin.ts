import { request } from '@/utils'

/**
 * 管理员信息 (登录管理员填写 'self') - 数据结构：UserInfo[]
 * @param userId 管理员id
 * @returns
 */
export function getAdminInfoAPI() {
  return request.get('/admin/info')
}

type AdminLogin = {
  email: string
  password: string
}

/**
 * 登录
 * @param data 管理员邮箱、密码
 * @returns
 */
export function loginAPI(data: AdminLogin) {
  return request.post('/admin/login', data)
}

/**
 * 获取未审核帖子列表
 * @param page 页数
 * @param limit 每页数量
 * @returns
 */
export function getUnreviewPostAPI(page: number, limit: number) {
  return request.get(`/admin/unreview-post?page=${page}&limit=${limit}`)
}

/**
 * 更新帖子状态
 * @param data postId: 帖子id, status: 帖子状态（1通过，2不通过）, reason: 不通过原因
 * @returns
 */
export function updatePostStatusAPI(data: {
  postId: string
  status: 1 | 2
  reason: string
  punishTime?: number
}) {
  return request.post('/admin/post-review', {
    ...data,
    punishTime: data.punishTime ?? 0,
  })
}

/**
 * 设置帖子违规（举报）
 * @param data postId: 帖子id, status: 帖子状态（2不通过）, reason: 不通过原因
 * @returns
 */
export function setPostViolateAPI(data: {
  postId: string
  status: 2
  reason: string
  punishTime?: number
}) {
  return request.post('/admin/post-violate', {
    ...data,
    punishTime: data.punishTime ?? 0,
  })
}

/**
 * 设置评论违规（举报）
 * @param data postId: 帖子id, commentId: 评论id, reason: 不通过原因
 * @returns
 */
export function setCommentViolateAPI(data: {
  postId: string
  commentId: number
  reason: string
  punishTime?: number
}) {
  return request.post('/admin/comment-violate', {
    ...data,
    punishTime: data.punishTime ?? 0,
  })
}

/**
 * 获取帖子举报列表
 * @param page 页数
 * @param limit 每页数量
 * @returns
 */
export function getPostReportReasonAPI(page: number, limit: number) {
  return request.get(`/admin/post-report?page=${page}&limit=${limit}`)
}

/**
 * 获取评论举报列表
 * @param page 页数
 * @param limit 每页数量
 * @returns
 */
export function getCommentReportReasonAPI(page: number, limit: number) {
  return request.get(`/admin/comment-report?page=${page}&limit=${limit}`)
}

/**
 * 删除帖子举报
 * @param postId
 * @returns
 */
export function deletePostReportAPI(postId: string) {
  return request.delete(`/admin/post-report/${postId}`)
}

/**
 * 删除评论举报
 * @param commentId
 * @returns
 */
export function deleteCommentReportAPI(commentId: number) {
  return request.delete(`/admin/comment-report/${commentId}`)
}

type ProhibitionType = {
  userId: string
  prohibition: 'muteUntil' | 'postProhibitUntil' | 'loginProhibitUntil'
  hours: number
  reason: string
  punishTime: number
  postId: string
  commentId?: number
}

/**
 * 设置用户权限限制天数
 * @param
 * @returns
 */
export function setUserPermProhibitTimeAPI(data: ProhibitionType) {
  return request.post('/admin/prohibition', data)
}

/**
 * 查询用户权限信息
 * @returns
 */
export function getUserPermsAPI(page: number, limit: number) {
  return request.get(`/admin/user-perms?page=${page}&limit=${limit}`)
}

type UserPerm = 'user_speak' | 'user_post' | 'user_login'
type AdminPerm = 'post_review' | 'report_review' | 'user_perm_modify'

/**
 * 添加用户权限
 * @param data userId: 用户id, permission: 权限
 * @returns
 */
export function addUserPermAPI(data: {
  userId: string
  permission: UserPerm
  reason: string
}) {
  return request.post('/admin/user-perm', data)
}

/**
 * 添加管理员权限
 * @param data userId: 用户id, permission: 权限
 * @returns
 */
export function addAdminPermAPI(data: {
  userId: string
  permission: AdminPerm
}) {
  return request.post('/admin/admin-perm', data)
}

/**
 * 删除用户权限
 * @param data userId: 用户id, permission: 权限
 * @returns
 */
export function delUserPermAPI(data: {
  userId: string
  permission: UserPerm
  reason: string
}) {
  return request.delete('/admin/user-perm', { data })
}

/**
 * 删除管理员权限
 * @param data userId: 用户id, permission: 权限
 * @returns
 */
export function delAdminPermAPI(data: {
  userId: string
  permission: AdminPerm
}) {
  return request.delete('/admin/admin-perm', { data })
}

/**
 * 取消用户暂时性权限限制
 * @param data
 * @returns
 */
export function setUserTempPunish2NullAPI(data: {
  userId: string
  prohibition: 'muteUntil' | 'postProhibitUntil' | 'loginProhibitUntil'
  reason: string
}) {
  return request.post('/admin/punishment-to-null', data)
}
