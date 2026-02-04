import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreatePostDto, @Req() req: AuthRequest) {
    await this.postService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('postImages', uploadOptions))
  async uploadImage(
    @Body() dto: UploadImageDto,
    @UploadedFile() file: { filename: string },
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
    return this.postService.find(+page, +limit);
  }

  @Get('search')
  async search(@Query() dto: SearchPostDTO) {
    return this.postService.search(dto);
  }

  @Patch('/view/:postId')
  updateViewCount(@Param('postId') postId: string) {
    return this.postService.updateViewCount(postId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':postId')
  findOne(
    @Param('postId') postId: string,
    @OptionalUser() userId: string | null,
  ) {
    return this.postService.findOne(postId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
