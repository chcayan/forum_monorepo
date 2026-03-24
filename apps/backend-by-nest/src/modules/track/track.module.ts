import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackEvents } from './entities/track-events.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackEvents])],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
