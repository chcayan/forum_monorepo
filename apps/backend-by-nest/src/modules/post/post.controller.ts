import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SearchPostDTO } from './dto/search-post.dto';
import { OptionalJwtAuthGuard } from 'src/common/guard/optional-jwt-auth.guard';
import { OptionalUser } from 'src/common/decorator/optional-user.decorator';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interface/auth-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/upload-image.dto';
import { uploadOptions } from 'src/common/config/upload.config';
import { CommentDto } from './dto/comment.dto';
import { UserPermissionGuard } from 'src/common/guard/permission.guard';
import { UserPermission } from 'src/common/decorator/permission.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard, UserPermissionGuard)
  @UserPermission('user_post')
  async create(@Body() dto: CreatePostDto, @Req() req: AuthRequest) {
    await this.postService.create(dto.content, dto.isPublic, req.user.id);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, UserPermissionGuard)
  @UserPermission('user_post')
  @UseInterceptors(FileInterceptor('postImages', uploadOptions))
  async uploadImage(
    @Body() dto: UploadImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return;
    const imagePath = `/uploads/${file?.filename}`;
    await this.postService.addImage(dto.pId, imagePath);
  }

  @Get()
  async find(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.postService.find(page, limit);
  }

  @Get('search')
  async search(@Query() dto: SearchPostDTO) {
    return this.postService.search(dto.result, dto.page, dto.limit);
  }

  @Patch('/view/:postId')
  async updateViewCount(@Param('postId') postId: string) {
    return this.postService.updateViewCount(postId);
  }

  @Post('comment')
  @UseGuards(JwtAuthGuard, UserPermissionGuard)
  @UserPermission('user_speak')
  async publishComment(
    @OptionalUser() userId: string,
    @Body() dto: CommentDto,
  ) {
    return this.postService.publishComment(userId, dto.postId, dto.content);
  }

  @Get('comment/:postId')
  async findCommentsByPostId(@Param('postId') postId: string) {
    return this.postService.findCommentsByPostId(postId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':postId')
  async findOne(
    @Param('postId') postId: string,
    @OptionalUser() userId: string | null,
  ) {
    return this.postService.findOne(postId, userId);
  }
}
