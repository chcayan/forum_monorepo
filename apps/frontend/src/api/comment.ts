import { request } from '@/utils'

/**
 * 发送评论
 * @param data 帖子id、评论内容
 * @returns
 */
export function publishCommentAPI(data: { postId: string; content: string }) {
  return request.post('/post/comments', data)
}

/**
 * 评论列表
 * @param postId 帖子id
 * @returns
 */
export function getCommentListAPI(postId: string) {
  return request.get(`/post/comments/${postId}`)
}
