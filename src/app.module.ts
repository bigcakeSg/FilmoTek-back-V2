import { Module } from '@nestjs/common';
import { GenresModule } from './genres/genres.module';
import { NamesModule } from './names/names.module';
import { SupportsModule } from './supports/supports.module';
import { MoviesModule } from './movies/movies.module';
import { PicturesModule } from './pictures/pictures.module';

@Module({
  imports: [GenresModule, NamesModule, SupportsModule, MoviesModule, PicturesModule],
})
export class AppModule {}
