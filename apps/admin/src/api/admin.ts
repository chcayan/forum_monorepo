import { request } from '@/utils'

/**
 * 管理员信息 (登录管理员填写 'self') - 数据结构：UserInfo[]
 * @param userId 管理员id
 * @returns
 */
export function getAdminInfoAPI(userId: string) {
  return request.get(`/user/${userId}`)
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
 * 获取帖子举报列表
 * @param page 页数
 * @param limit 每页数量
 * @returns
 */
export function getPostReportReasonAPI(page: number, limit: number) {
  return request.get(`/admin/post-report?page=${page}&limit=${limit}`)
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
 * 检测用户是否被封禁（这里用于检测jwt是否过期）
 * @returns
 */
export function checkIsLoginProhibitAPI() {
  return request.post('/user/check-login-prohibit')
}

type ProhibitionType = {
  userId: string
  prohibition: 'muteUntil' | 'postProhibitUntil' | 'loginProhibitUntil'
  hours: number
  reason: string
  punishTime: number
  postId: string
}

/**
 * 设置用户权限限制天数
 * @param
 * @returns
 */
export function setUserPermProhibitTimeAPI(data: ProhibitionType) {
  return request.post('/admin/prohibition', data)
}
