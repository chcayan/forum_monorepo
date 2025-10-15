# 聊天接口

## 获取聊天记录接口

- GET /chat/history (query)
  - followId: string

- 数据结构：ChatInfo[]

## 获取未读消息数量接口

- GET /chat/unread (param)
  - followId: string

数据结构：UnreadInfo[]

## 标记为已读接口

- POST /chat/mark-as-read (body)
  - from: string
