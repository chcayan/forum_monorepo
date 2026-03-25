import type { EventItem } from '@forum-monorepo/sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackService {
  saveBatch(events: EventItem[]) {
    console.log('埋点数据:', events);
  }
}
