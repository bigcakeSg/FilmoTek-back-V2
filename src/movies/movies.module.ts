import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MoviesProviders } from './movies.providers';
import { DatabaseModule } from '../database/database.module';
import { GenresProviders } from 'src/genres/genres.providers';
import { NamesProviders } from 'src/names/names.providers';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [MoviesController],
  providers: [MoviesService, ...MoviesProviders, ...GenresProviders, ...NamesProviders],
})
export class MoviesModule {}
