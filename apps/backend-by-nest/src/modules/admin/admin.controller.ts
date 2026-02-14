import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PermissionDto } from './dto/permission.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { AdminPermissionGuard } from 'src/common/guard/permission.guard';
import { AdminPermission } from 'src/common/decorator/permission.decorator';
import { AuditPostDto } from './dto/audit-post.dto';
import { LoginDto } from './dto/login.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.adminService.login(dto.email, dto.password);
  }

  @Post('user-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('edit_user')
  async addUserPermission(@Body() dto: PermissionDto) {
    return this.adminService.addUserPermission(dto.userId, dto.permission);
  }

  @Delete('user-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('edit_user')
  async delUserPermission(@Body() dto: PermissionDto) {
    return this.adminService.delUserPermission(dto.userId, dto.permission);
  }

  @Post('admin-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('edit_user')
  async addAdminPermission(@Body() dto: PermissionDto) {
    return this.adminService.addAdminPermission(dto.userId, dto.permission);
  }

  @Delete('admin-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('edit_user')
  async delAdminPermission(@Body() dto: PermissionDto) {
    return this.adminService.delAdminPermission(dto.userId, dto.permission);
  }

  @Post('audit-post')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('audit_post')
  async auditPost(@Body() dto: AuditPostDto) {
    return this.adminService.auditPost(dto.postId, dto.status);
  }
}
