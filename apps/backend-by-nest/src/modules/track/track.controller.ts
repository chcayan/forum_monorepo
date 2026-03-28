import { Body, Controller, Post } from '@nestjs/common';
import { TrackService } from './track.service';
import type { ErrorEventItem, UserEventItem } from '@forum-monorepo/sdk';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post('user')
  async saveUserTrack(@Body() body: UserEventItem[]) {
    return this.trackService.saveUserTrack(body);
  }

  @Post('error')
  async saveErrorTrack(@Body() body: ErrorEventItem[]) {
    return this.trackService.saveErrorTrack(body);
  }
}
