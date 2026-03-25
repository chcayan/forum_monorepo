import type { EventItem } from '@forum-monorepo/sdk';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackEvents } from './entities/track-events.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(TrackEvents)
    private readonly trackEventsRepository: Repository<TrackEvents>,
  ) {}

  async saveBatch(events: EventItem[]) {
    return;
    const entities = (events ?? [])
      .filter((item) => item)
      .map((item) =>
        this.trackEventsRepository.create({
          event: item.event,
          userId: item.userId || 'guest',
          page: item.page,
          data: item.data as string,
        }),
      );
    await this.trackEventsRepository.save(entities);
  }
}
