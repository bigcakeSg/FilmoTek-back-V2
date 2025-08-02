import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GenresModule } from './genres/genres.module';
import { NamesModule } from './names/names.module';
import { SupportsModule } from './supports/supports.module';
import { MoviesModule } from './movies/movies.module';
import { PicturesModule } from './pictures/pictures.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'media'),
      serveRoot: '/media',
    }),
    GenresModule,
    NamesModule,
    SupportsModule,
    MoviesModule,
    PicturesModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
