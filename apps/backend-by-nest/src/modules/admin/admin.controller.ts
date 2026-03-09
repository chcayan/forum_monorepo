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
import { UserProhibitionDto } from './dto/user-prohibition.dto';
import { OptionalUser } from 'src/common/decorator/optional-user.decorator';
import { CommentReportDto } from './dto/comment-report.dto';

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
  async reviewPost(
    @Body() dto: PostReviewDto,
    @OptionalUser() adminId: string,
  ) {
    const userId = await this.adminService.findUserIdByPostId(dto.postId);
    if (dto.status === 1) {
      if (userId) {
        await this.adminService.setUserLog(
          userId,
          adminId,
          '帖子审核通过',
          'post_review_pass',
          dto.punishTime,
          dto.postId,
        );
      }
    } else if (dto.status === 2) {
      if (userId) {
        await this.adminService.setUserLog(
          userId,
          adminId,
          dto.reason,
          'post_review_violate',
          dto.punishTime,
          dto.postId,
        );
        await this.adminService.createViolationReason(dto.postId, dto.reason);
      }
    }
    return this.adminService.reviewPost(dto.postId, dto.status);
  }

  @Post('post-violate')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('post_review')
  async setPostViolate(
    @Body() dto: PostReviewDto,
    @OptionalUser() adminId: string,
  ) {
    const userId = await this.adminService.findUserIdByPostId(dto.postId);
    if (dto.status === 2) {
      if (userId) {
        await this.adminService.setUserLog(
          userId,
          adminId,
          dto.reason,
          'post_violate',
          dto.punishTime,
          dto.postId,
        );
        await this.adminService.createViolationReason(dto.postId, dto.reason);
      }
    }
    return this.adminService.reviewPost(dto.postId, dto.status);
  }

  @Post('comment-violate')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('post_review')
  async setCommentViolate(
    @Body() dto: CommentReportDto,
    @OptionalUser() adminId: string,
  ) {
    const userId = await this.adminService.findUserIdByPostId(dto.postId);
    if (userId) {
      await this.adminService.setUserLog(
        userId,
        adminId,
        dto.reason,
        'comment_violate',
        dto.punishTime,
        dto.postId,
        dto.commentId,
      );
    }
    return this.adminService.setCommentViolate(dto.commentId);
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

  @Get('comment-report')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('report_review')
  async findCommentReports(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.adminService.findCommentReports(page, limit);
  }

  @Delete('post-report/:postId')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('report_review')
  async deletePostReport(@Param('postId') postId: string) {
    return this.adminService.deletePostReport(postId);
  }

  @Delete('comment-report/:commentId')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('report_review')
  async deleteCommentReport(@Param('commentId') commentId: number) {
    return this.adminService.deleteCommentReport(commentId);
  }

  @Get('user-perms')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('user_perm_modify')
  async getUserPerms(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.adminService.getUserPerms(page, limit);
  }

  @Post('prohibition')
  @UseGuards(JwtAuthGuard, AdminPermissionGuard)
  @AdminPermission('report_review')
  async setUserProhibition(
    @Body() dto: UserProhibitionDto,
    @OptionalUser() adminId: string,
  ) {
    if (dto.prohibition === 'postProhibitUntil') {
      await this.adminService.setUserLog(
        dto.userId,
        adminId,
        dto.reason,
        'user_post_prohibit',
        dto.punishTime,
        dto.postId,
      );
    } else if (dto.prohibition === 'muteUntil') {
      await this.adminService.setUserLog(
        dto.userId,
        adminId,
        dto.reason,
        'user_mute',
        dto.punishTime,
        dto.postId,
        dto.commentId,
      );
    }
    return this.adminService.setUserProhibition(
      dto.userId,
      dto.prohibition,
      dto.hours,
    );
  }
}
