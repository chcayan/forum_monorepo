import { AdminPermissionBit, UserPermissionBit } from './auth.bit';

export const UserPermissionMap: Record<string, UserPermissionBit> = {
  user_speak: UserPermissionBit.SPEAK,
  user_post: UserPermissionBit.POST,
  user_login: UserPermissionBit.LOGIN,
};

export const AdminPermissionMap: Record<string, AdminPermissionBit> = {
  audit_post: AdminPermissionBit.AUDIT_POST,
  edit_post: AdminPermissionBit.EDIT_POST,
  edit_user: AdminPermissionBit.EDIT_USER,
};

export const UserPermissionCodeToIdMap: Record<string, number> = {
  user_speak: 1,
  user_post: 2,
  user_login: 3,
};

export const AdminPermissionCodeToIdMap: Record<string, number> = {
  audit_post: 4,
  edit_post: 5,
  edit_user: 6,
};

export const UserPermissionIdToBitMap: Record<number, UserPermissionBit> = {
  1: UserPermissionBit.SPEAK,
  2: UserPermissionBit.POST,
  3: UserPermissionBit.LOGIN,
};

export const AdminPermissionCodeToBitMap: Record<number, AdminPermissionBit> = {
  4: AdminPermissionBit.AUDIT_POST,
  5: AdminPermissionBit.EDIT_POST,
  6: AdminPermissionBit.EDIT_USER,
};
