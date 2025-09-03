import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { DatabaseModule } from 'src/database/database.module';
import { MoviesProviders } from 'src/movies/movies.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [StatsController],
  providers: [StatsService, ...MoviesProviders],
})
export class StatsModule {}
