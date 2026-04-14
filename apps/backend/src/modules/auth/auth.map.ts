import { AdminPermissionBit, UserPermissionBit } from './auth.bit';

export const UserPermissionMap: Record<string, UserPermissionBit> = {
  user_speak: UserPermissionBit.SPEAK,
  user_post: UserPermissionBit.POST,
  user_login: UserPermissionBit.LOGIN,
};

export const AdminPermissionMap: Record<string, AdminPermissionBit> = {
  post_review: AdminPermissionBit.POST_REVIEW,
  report_review: AdminPermissionBit.REPORT_REVIEW,
  user_perm_modify: AdminPermissionBit.USER_PERM_MODIFY,
};

export const UserPermissionCodeToIdMap: Record<string, number> = {
  user_speak: 1,
  user_post: 2,
  user_login: 3,
};

export const AdminPermissionCodeToIdMap: Record<string, number> = {
  post_review: 4,
  report_review: 5,
  user_perm_modify: 6,
};

export const UserPermissionIdToBitMap: Record<number, UserPermissionBit> = {
  1: UserPermissionBit.SPEAK,
  2: UserPermissionBit.POST,
  3: UserPermissionBit.LOGIN,
};

export const AdminPermissionCodeToBitMap: Record<number, AdminPermissionBit> = {
  4: AdminPermissionBit.POST_REVIEW,
  5: AdminPermissionBit.REPORT_REVIEW,
  6: AdminPermissionBit.USER_PERM_MODIFY,
};
