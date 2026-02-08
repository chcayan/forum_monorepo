import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { uploadOptions } from 'src/common/config/upload.config';
import { OptionalUser } from 'src/common/decorator/optional-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { OptionalJwtAuthGuard } from 'src/common/guard/optional-jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto.email, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.userService.register(dto.email, dto.password);
  }

  @Get('post/:userId')
  async findUserPost(
    @Param('userId') userId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.userService.findUserPostByUserId(userId, page, limit);
  }

  @Delete('post/:postId')
  @UseGuards(JwtAuthGuard)
  async delPost(
    @OptionalUser() userId: string,
    @Param('postId') postId: string,
  ) {
    return this.userService.delPost(userId, postId);
  }

  @Patch('post/public/:postId')
  @UseGuards(JwtAuthGuard)
  async setPostPublic(
    @OptionalUser() userId: string,
    @Param('postId') postId: string,
  ) {
    return this.userService.setPostPublic(userId, postId);
  }

  @Patch('post/private/:postId')
  @UseGuards(JwtAuthGuard)
  async setPostPrivate(
    @OptionalUser() userId: string,
    @Param('postId') postId: string,
  ) {
    return this.userService.setPostPrivate(userId, postId);
  }

  @Get('collect/ids')
  @UseGuards(JwtAuthGuard)
  async findCollectedPostIdsByViewerId(@OptionalUser() userId: string) {
    return this.userService.findCollectedPostIdsByViewerId(userId);
  }

  @Post('collect/:postId')
  @UseGuards(JwtAuthGuard)
  async addCollect(
    @OptionalUser() userId: string,
    @Param('postId') postId: string,
  ) {
    return this.userService.addCollect(userId, postId);
  }

  @Delete('collect/:postId')
  @UseGuards(JwtAuthGuard)
  async delCollect(
    @OptionalUser() userId: string,
    @Param('postId') postId: string,
  ) {
    return this.userService.delCollect(userId, postId);
  }

  @Get('collect/:viewerId')
  @UseGuards(OptionalJwtAuthGuard)
  async findCollectedPostByViewerId(
    @Param('viewerId') viewerId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @OptionalUser() userId: string,
  ) {
    return this.userService.findCollectedPostByViewerId(
      viewerId,
      page,
      limit,
      userId,
    );
  }

  @Get('friend')
  @UseGuards(JwtAuthGuard)
  async findUserFriend(@OptionalUser() userId: string) {
    return this.userService.findUserFriend(userId);
  }

  @Post('follow/:followId')
  @UseGuards(JwtAuthGuard)
  async addFollow(
    @OptionalUser() userId: string,
    @Param('followId') followId: string,
  ) {
    return this.userService.addFollow(userId, followId);
  }

  @Delete('follow/:followId')
  @UseGuards(JwtAuthGuard)
  async delFollow(
    @OptionalUser() userId: string,
    @Param('followId') followId: string,
  ) {
    return this.userService.delFollow(userId, followId);
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return this.userService.search(keyword);
  }

  @Get('follows/:userId')
  async findUserFollows(@Param('userId') userId: string) {
    return this.userService.findUserFollows(userId);
  }

  @Get('fans/:userId')
  async findUserFans(@Param('userId') userId: string) {
    return this.userService.findUserFans(userId);
  }

  @Get(':id')
  findOne(@Param('id') userId: string) {
    return this.userService.findOne(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'bgImg', maxCount: 1 },
      ],
      uploadOptions,
    ),
  )
  update(
    @OptionalUser() userId: string,
    @Body() dto: UpdateUserDto,
    @UploadedFiles()
    files?: {
      avatar?: Express.Multer.File[];
      bgImg?: Express.Multer.File[];
    },
  ) {
    return this.userService.update(
      userId,
      dto.username,
      dto.sex,
      dto.signature,
      files,
    );
  }
}
