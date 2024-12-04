import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { genresProviders } from './genres.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GenresController],
  providers: [GenresService, ...genresProviders],
})
export class GenresModule {}
