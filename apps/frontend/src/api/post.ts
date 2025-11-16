import { request } from '@/utils'
import { escapeHTML } from '@/utils/format'

/**
 * 帖子列表 - 数据结构：PostInfo[]
 * @param page 页数
 * @param limit 每页帖子数量
 * @returns
 */
export function getPostListAPI(page: number, limit: number) {
  return request.get(`/post?page=${page}&limit=${limit}`)
}

/**
 * 帖子详情 - 数据结构：PostDetail[]
 * @param postId 帖子id
 * @returns
 */
export function getPostDetailAPI(postId: string) {
  return request.get(`/post/${postId}`)
}

/**
 * 更新浏览数
 * @param postId 帖子id
 * @returns
 */
export function updatePostViewAPI(postId: string) {
  return request.patch(`/post/view/${postId}`)
}

type PostPublish = {
  content: string
  isPublic: string
  postImages?: File[]
}

/**
 * 发送帖子
 * @param data 帖子内容、公开/隐藏、图片(max = 9)
 * @returns
 */
export function publishPostAPI(data: PostPublish) {
  const formData = new FormData()
  formData.append('content', escapeHTML(data.content) as string)
  formData.append('isPublic', data.isPublic)
  if (data.postImages) {
    data.postImages.forEach((file) => {
      formData.append('postImages', file)
    })
  }
  return request.post('/post/publish', formData)
}

/**
 * 搜索接口 - 数据结构：PostInfo[]
 * @param result 搜索关键词
 * @param page 页数
 * @param limit 每页帖子数量
 * @returns
 */
export function searchPostAPI(result: string, page: number, limit: number) {
  return request.get(
    `/post/search?result=${result}&?page=${page}&limit=${limit}`
  )
}
