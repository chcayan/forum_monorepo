# 帖子接口

## 帖子列表接口

- GET /post (query)
  - user_id
  - page
  - limit

- 数据结构：PostInfo

## 帖子详情接口

- GET /post/:post_id (param)

- 数据结构：PostDetail

## 更新浏览数接口

- PATCH /post/view/:p_id (param)
