import { Body, Controller, Delete, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PermissionDto } from './dto/permission.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('user-perm')
  async addUserPermission(@Body() dto: PermissionDto) {
    return this.adminService.addUserPermission(dto.userId, dto.permission);
  }

  @Delete('user-perm')
  async delUserPermission(@Body() dto: PermissionDto) {
    return this.adminService.delUserPermission(dto.userId, dto.permission);
  }

  @Post('admin-perm')
  async addAdminPermission(@Body() dto: PermissionDto) {
    return this.adminService.addAdminPermission(dto.userId, dto.permission);
  }

  @Delete('admin-perm')
  async delAdminPermission(@Body() dto: PermissionDto) {
    return this.adminService.delAdminPermission(dto.userId, dto.permission);
  }
}
