import type { ErrorEventItem, UserEventItem } from '@forum-monorepo/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTrack } from './entities/user-track.entity';
import { Repository } from 'typeorm';
import { ErrorTrack } from './entities/error-track.entity';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(UserTrack)
    private readonly userTrackRepository: Repository<UserTrack>,
    @InjectRepository(ErrorTrack)
    private readonly errorTrackRepository: Repository<ErrorTrack>,
  ) {}

  async saveUserTrack(events: UserEventItem[]) {
    const entities = (events ?? [])
      .filter((item) => item)
      .map((item) =>
        this.userTrackRepository.create({
          event: item.event,
          userId: item.userId || 'guest',
          page: item.page,
          data: item.data as string,
        }),
      );
    await this.userTrackRepository.save(entities);
  }

  async saveErrorTrack(events: ErrorEventItem[]) {
    const entities = (events ?? [])
      .filter((item) => item)
      .map((item) =>
        this.errorTrackRepository.create({
          event: item.event,
          userId: item.userId || 'guest',
          data: item.data as string,
        }),
      );
    await this.errorTrackRepository.save(entities);
  }
}
