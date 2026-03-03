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
export function getUnAuditPostAPI(page: number, limit: number) {
  return request.get(`/admin/post?page=${page}&limit=${limit}`)
}

/**
 * 更新帖子状态
 * @param data postId: 帖子id, status: 帖子状态（1通过，2不通过）
 * @returns
 */
export function updatePostStatusAPI(data: { postId: string; status: 1 | 2 }) {
  return request.post('/admin/audit-post', data)
}

/**
 * 创建帖子违规原因
 * @param data postId: 帖子id, reason: 违规原因
 * @returns
 */
export function createViolationReasonAPI(data: {
  postId: string
  reason: string
}) {
  return request.post(`/admin/audit-post/${data.postId}`, {
    reason: data.reason,
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

export function deletePostReportAPI(id: number) {
  return request.delete(`/admin/post-report/${id}`)
}
