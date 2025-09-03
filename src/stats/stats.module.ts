import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { DatabaseModule } from 'src/database/database.module';
import { MoviesProviders } from 'src/movies/movies.providers';
import { GenresProviders } from 'src/genres/genres.providers';
import { GenresService } from 'src/genres/genres.service';

@Module({
  imports: [DatabaseModule],
  controllers: [StatsController],
  providers: [StatsService, GenresService, ...GenresProviders, ...MoviesProviders],
})
export class StatsModule {}
