import { Controller, Param, Sse } from '@nestjs/common';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse(':userId')
  connect(@Param('userId') userId: string) {
    return this.sseService.connect(userId);
  }
}
