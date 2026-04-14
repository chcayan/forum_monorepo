import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTrack } from './entities/user-track.entity';
import { ErrorTrack } from './entities/error-track.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTrack, ErrorTrack])],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
