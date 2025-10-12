# 评论接口

## 发送评论接口

- POST /post/comments (body)
  - postId: string
  - content: string

## 评论列表接口

- GET /post/comments/:postId (param)

- 数据结构：CommentList[]
