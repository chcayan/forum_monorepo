export enum UserPermissionBit {
  SPEAK = 1 << 0, // 001 发言
  POST = 1 << 1, // 010 发帖
  LOGIN = 1 << 2, // 100 允许登录
}

export enum AdminPermissionBit {
  AUDIT_POST = 1 << 0, // 001 审核帖子
  EDIT_POST = 1 << 1, // 010 修改帖子状态
  EDIT_USER = 1 << 2, // 100 修改用户状态
}
