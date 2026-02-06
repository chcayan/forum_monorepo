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
    return this.userService.findUserPost(userId, page, limit);
  }

  @Get('collect/:viewerId')
  @UseGuards(OptionalJwtAuthGuard)
  async findUserCollectedPost(
    @Param('viewerId') viewerId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @OptionalUser() userId: string,
  ) {
    return this.userService.findUserCollectedPost(
      viewerId,
      page,
      limit,
      userId,
    );
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
