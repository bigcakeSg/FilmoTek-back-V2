import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GenresModule } from './genres/genres.module';
import { CompaniesModule } from './companies/companies.module';
import { NamesModule } from './names/names.module';
import { MoviesModule } from './movies/movies.module';
import { PicturesModule } from './pictures/pictures.module';
import { UsersModule } from './users/users.module';
import { CollectionsModule } from './collections/collections.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, '..', 'media'),
      rootPath: join(process.cwd(), 'media'),
      serveRoot: '/media',
    }),
    GenresModule,
    CompaniesModule,
    NamesModule,
    MoviesModule,
    PicturesModule,
    UsersModule,
    CollectionsModule,
    AuthModule,
    StatsModule,
  ],
})
export class AppModule {}
