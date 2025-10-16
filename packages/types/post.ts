// 帖子列表
export interface PostInfo {
  p_id: string
  user_id: string
  p_view_count: number
  p_collect_count: number
  p_share_count: number
  p_comment_count: number
  p_content: string
  p_images: string
  publish_time: string
  user_avatar: string
  username: string
}

export type PostTotal = { total: number }

// 帖子详情
export interface PostDetail extends PostInfo {
  is_public: string
}
