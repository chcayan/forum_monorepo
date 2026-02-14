// 帖子列表
export interface PostInfo {
  pId: string
  userId: string
  pViewCount: string
  pCollectCount: string
  pShareCount: string
  pCommentCount: string
  pContent: string
  pImages: string[]
  status: 0 | 1 | 2
  publishTime: string
  userAvatar: string
  username: string
}

export type PostTotal = { total: number }

// 帖子详情
export interface PostDetail extends PostInfo {
  isPublic: string
}

// 评论列表
export interface CommentList {
  commentId: string
  userId: string
  pId: string
  cContent: string
  createdTime: string
  userAvatar: string
  username: string
}
