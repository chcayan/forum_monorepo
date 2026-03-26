import { request, escapeHTML } from '@/utils'
import { deleteUserPostAPI } from './user'

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
    `/post/search?result=${result}&page=${page}&limit=${limit}`
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
  isPublic: 'true' | 'false'
  postImages?: File[]
  tags?: string[]
}

/**
 * 发送帖子
 * @param data 帖子内容、公开/隐藏、图片(max = 9)
 * @returns
 */
export async function publishPostAPI(data: PostPublish) {
  let postId

  try {
    const res = await request.post('/post', {
      isPublic: data.isPublic,
      content: data.content,
      tags: data.tags,
    })

    postId = res.data.data.postId

    if (data.postImages?.length !== 0) {
      let index = 0
      for (const file of data.postImages!) {
        const formData = new FormData()

        formData.append('index', index.toString())
        formData.append('pId', postId)
        formData.append('postImages', file)

        index++
        await request.post('/post/upload-image', formData)
      }
    }

    return postId
  } catch (err) {
    await deleteUserPostAPI(postId)
    throw err
  }
}

/**
 * 更新浏览数
 * @param postId 帖子id
 * @returns
 */
export function updatePostViewAPI(postId: string) {
  return request.patch(`/post/view/${postId}`)
}

type UpdatePostInfo = {
  content: string
  isPublic: string
  postId: string
  postImages?: File[]
  tags?: string[]
}

/**
 * 修改帖子信息
 * @param data 更新帖子信息
 * @returns
 */
export async function updatePostInfoAPI(data: UpdatePostInfo) {
  const res = await request.post('/post/modify', data)
  const postId = res.data.data.postId

  if (data.postImages?.length !== 0) {
    let index = 0
    for (const file of data.postImages!) {
      const formData = new FormData()

      formData.append('index', index.toString())
      formData.append('pId', postId)
      formData.append('postImages', file)

      index++
      await request.post('/post/upload-image', formData)
    }
  }

  return postId
}

/**
 * 添加帖子举报
 * @param data postId, reason
 * @returns
 */
export function createPostReportAPI(data: { postId: string; reason: string }) {
  return request.post('/post/post-report', data)
}

/**
 * 添加评论举报
 * @param data commentId, reason
 * @returns
 */
export function createCommentReportAPI(data: {
  commentId: number
  reason: string
}) {
  return request.post('/post/comment-report', data)
}

/**
 * 查询审核通过的帖子id数组
 * @returns
 */
export function getReviewPassIdsAPI() {
  return request.get('/post/review-pass-ids')
}

/**
 * 根据tag查询帖子
 * @param name tag 名字
 * @param page 页数
 * @param limit 每页帖子数量
 * @returns
 */
export function getPostsByTagAPI(name: string, page: number, limit: number) {
  return request.get(`/post/tag?name=${name}&page=${page}&limit=${limit}`)
}
