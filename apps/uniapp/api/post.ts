import { useUserStore } from '../stores'
import { baseUrl, request } from '@/utils'
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
export async function publishPostAPI(data: PostPublish) {
  if (data.postImages?.length === 0) {
    return request.post('/post/publish', {
      content: escapeHTML(data.content),
      isPublic: data.isPublic,
    })
  } else {
    const userStore = useUserStore()
    const token = userStore.token
    if (!token) {
      console.error('unauth')
      return
    }
    const res = await request.post('/post/create', {
      content: escapeHTML(data.content),
      isPublic: data.isPublic,
    })
    const p_id = res.data.p_id
    for (const file of data.postImages) {
      await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: baseUrl + '/post/upload-image',
          header: {
            Authorization: `Bearer ${token}`,
          },
          filePath: file?.path || file?.url,
          name: 'postImages',
          formData: { p_id: p_id },
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        })
      })
    }
  }
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
