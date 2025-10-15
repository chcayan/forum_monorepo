# 帖子接口

## 帖子列表接口

- GET /post (query)
  - page: number
  - limit: number

- 数据结构：PostInfo[]

## 帖子详情接口

- GET /post/:postId (param)

- 数据结构：PostDetail[]

## 更新浏览数接口

- PATCH /post/view/:postId (param)

## 发送帖子接口

- POST /post/publish (body)
  - content: string
  - isPublic: string
  - postImages?: File[]

## 搜索接口

- GET /post/search (query)
  - result: string

- 数据结构：PostInfo[]
