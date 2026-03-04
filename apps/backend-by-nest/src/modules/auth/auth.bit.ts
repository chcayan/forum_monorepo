export enum UserPermissionBit {
  SPEAK = 1 << 0, // 001 发言
  POST = 1 << 1, // 010 发帖
  LOGIN = 1 << 2, // 100 允许登录
}

export enum AdminPermissionBit {
  POST_REVIEW = 1 << 0, // 001 审核帖子
  REPORT_REVIEW = 1 << 1, // 010 审核帖子/评论举报
  USER_PERM_MODIFY = 1 << 2, // 100 修改用户权限
}
