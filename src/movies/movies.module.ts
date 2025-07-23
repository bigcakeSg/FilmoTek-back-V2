import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MoviesProviders } from './movies.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MoviesController],
  providers: [MoviesService, ...MoviesProviders],
})
export class MoviesModule {}
