import { request } from '@/utils'

/**
 * 帖子详情 - 数据结构：PostDetail[]
 * @param postId 帖子id
 * @returns
 */
export function getPostDetailAPI(postId: string) {
  return request.get(`/post/${postId}`)
}
