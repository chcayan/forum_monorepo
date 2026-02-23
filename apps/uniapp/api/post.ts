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
 * 搜索帖子 - 数据结构：PostInfo[]
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

/**
 * 帖子详情 - 数据结构：PostDetail[]
 * @param postId 帖子id
 * @returns
 */
export function getPostDetailAPI(postId: string) {
  return request.get(`/post/${postId}`)
}

/**
 * 查询帖子评论
 * @param postId 帖子id
 * @returns
 */
export function getCommentListAPI(postId: string) {
  return request.get(`/post/comment/${postId}`)
}

/**
 * 发送评论
 * @param data 帖子id、评论内容
 * @returns
 */
export function publishCommentAPI(data: { postId: string; content: string }) {
  data.content = escapeHTML(data.content)!
  return request.post('/post/comment', data)
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
  const res = await request.post('/post', {
    isPublic: data.isPublic,
    content: data.content,
  })

  const postId = res.data.data.postId

  if (data.postImages?.length !== 0) {
    const userStore = useUserStore()
    const token = userStore.token

    if (!token) {
      console.error('unauth')
      return
    }

    let index = 0
    for (const file of data.postImages!) {
      await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: baseUrl + '/post/upload-image',
          header: {
            Authorization: `Bearer ${token}`,
          },
          filePath: file?.path || file?.url,
          name: 'postImages',
          formData: { pId: postId, index: index.toString() },
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        })
      })
      index++
    }
  }

  return postId
}

/**
 * 更新浏览数
 * @param postId 帖子id
 * @returns
 */
export function updatePostViewAPI(postId: string) {
  return request.patch(`/post/view/${postId}`)
}
