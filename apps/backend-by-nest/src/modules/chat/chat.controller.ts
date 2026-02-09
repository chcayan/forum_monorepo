import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { OptionalUser } from 'src/common/decorator/optional-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:followId')
  @UseGuards(JwtAuthGuard)
  async findChatHistory(
    @OptionalUser() userId: string,
    @Param('followId') followId: string,
  ) {
    return this.chatService.findChatHistory(userId, followId);
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  async findChatUnread(@OptionalUser() userId: string) {
    return this.chatService.findChatUnRead(userId);
  }

  @Post('mark-as-read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @OptionalUser() userId: string,
    @Body('followId') followId: string,
  ) {
    return this.chatService.markAsRead(userId, followId);
  }

  @Post('ai/result')
  @UseGuards(JwtAuthGuard)
  async getAiChatResult(@Body('prompt') prompt: string) {
    return this.chatService.getAiChatResult(prompt);
  }
}
