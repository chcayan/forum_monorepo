import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackService {
  saveBatch(events: any[]) {
    console.log('埋点数据:', events);
  }
}
