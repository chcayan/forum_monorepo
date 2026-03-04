import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { PermissionDto } from './dto/permission.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { AdminPermissionGuard } from 'src/common/guard/permission.guard';
import { AdminPermission } from 'src/common/decorator/permission.decorator';
import { PostReviewDto } from './dto/post-review.dto';
import { LoginDto } from './dto/login.dto';
import { CreateViolationReasonDto } from './dto/create-violation-reason.dto';
import { UserProhibitionDto } from './dto/user-prohibition.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.adminService.login(dto.email, dto.password);
  }

  @Post('user-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('user_perm_modify')
  async addUserPermission(@Body() dto: PermissionDto) {
    return this.adminService.addUserPermission(dto.userId, dto.permission);
  }

  @Delete('user-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('user_perm_modify')
  async delUserPermission(@Body() dto: PermissionDto) {
    return this.adminService.delUserPermission(dto.userId, dto.permission);
  }

  @Post('admin-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('user_perm_modify')
  async addAdminPermission(@Body() dto: PermissionDto) {
    return this.adminService.addAdminPermission(dto.userId, dto.permission);
  }

  @Delete('admin-perm')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('user_perm_modify')
  async delAdminPermission(@Body() dto: PermissionDto) {
    return this.adminService.delAdminPermission(dto.userId, dto.permission);
  }

  @Post('post-review')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('post_review')
  async reviewPost(@Body() dto: PostReviewDto) {
    return this.adminService.reviewPost(dto.postId, dto.status);
  }

  @Post('post-review/:postId')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('post_review')
  async createViolationReason(
    @Param('postId') postId: string,
    @Body() dto: CreateViolationReasonDto,
  ) {
    return this.adminService.createViolationReason(postId, dto.reason);
  }

  @Get('unreview-post')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('post_review')
  async findUnreviewPost(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.adminService.findUnreviewPost(page, limit);
  }

  @Get('post-report')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('report_review')
  async findPostReports(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.adminService.findPostReports(page, limit);
  }

  @Delete('post-report/:id')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('report_review')
  async deletePostReport(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePostReport(id);
  }

  @Post('prohibition')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('report_review')
  async setUserProhibition(@Body() dto: UserProhibitionDto) {
    return this.adminService.setUserProhibition(
      dto.userId,
      dto.prohibition,
      dto.days,
    );
  }
}
