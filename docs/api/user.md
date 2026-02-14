# 用户接口

## 用户信息接口

- POST /user/info (body)
  - userId?: string

- 数据结构：UserInfo[]

## 查询用户帖子接口

- POST /user/post (body)
  - creatorUserId: string

- 数据结构：PostDetail[]

## 用户信息更新接口

- POST /user/update (body)
  - username: string
  - sex: string
  - signature: string
  - avatar?: file
  - bgImg?: file

## 用户收藏帖子信息接口

- POST /user/collect (body)
  - creatorUserId: string
  - page: number
  - limit: number

- 数据结构：PostDetail[]

## 用户收藏帖子p_id数组接口

- POST /user/collect/postId (body)
  - creatorUserId: string

- 数据结构：string[]

## 用户添加收藏接口

- POST /user/collect/add (body)
  - postId: string

## 用户取消收藏接口

- DELETE /user/collect/del (body)
  - postId: string

## 用户删除帖子接口

- DELETE /user/post/del (body)
  - postId: string

## 用户设置帖子公开接口

- PATCH /user/post/public (body)
  - postId: string

## 用户设置帖子非公开接口

- PATCH /user/post/private (body)
  - postId: string

## 用户好友接口

- GET /user/friend

- 数据结构：FriendInfo[]

## 用户添加关注接口

- POST /user/follow/add (body)
  - followId: string

## 用户取消关注接口

- DELETE /user/follow/del (body)
  - followId: string

## 搜索用户接口

- GET /user/search (query)
  - username: string

- 数据结构：UserBySearchInfo[]

## 用户关注接口

- GET /user/follows (query)
  - userId: string

数据结构：FriendInfo[]

## 用户粉丝接口

- GET /user/fans (query)
  - userId: string

数据结构：FriendInfo[]

# 登录/注册接口

## 登录接口

- POST /login (body)
  - email: string
  - password: string

## 注册接口

- POST /register (body)
  - email: string
  - password: string
