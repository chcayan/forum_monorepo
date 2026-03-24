import { Body, Controller, Post } from '@nestjs/common';
import { TrackService } from './track.service';
import {} from '@forum-monorepo/sdk';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post('batch')
  batch(@Body() body: any[]) {
    return this.trackService.saveBatch(body);
  }
}
