import { SetMetadata } from '@nestjs/common';
import {
  AdminPermissionCodeToIdMapInterface,
  UserPermissionCodeToIdMapInterface,
} from '../interface/permission.interface';
import {
  AdminPermissionMap,
  UserPermissionMap,
} from 'src/modules/auth/auth.map';
import { Permission } from '../constant/permission.constant';

export const UserPermission = (
  permission: keyof UserPermissionCodeToIdMapInterface,
) => SetMetadata(Permission.user, UserPermissionMap[permission]);

export const AdminPermission = (
  permission: keyof AdminPermissionCodeToIdMapInterface,
) => SetMetadata(Permission.admin, AdminPermissionMap[permission]);
