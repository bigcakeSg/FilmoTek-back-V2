import { Module } from '@nestjs/common';
import { GenresModule } from './genres/genres.module';
import { NamesModule } from './names/names.module';
import { SupportsModule } from './supports/supports.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [GenresModule, NamesModule, SupportsModule, MoviesModule],
})
export class AppModule {}
