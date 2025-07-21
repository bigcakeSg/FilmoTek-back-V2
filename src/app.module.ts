import { Module } from '@nestjs/common';
import { GenresModule } from './genres/genres.module';
import { NamesModule } from './names/names.module';

@Module({
  imports: [GenresModule, NamesModule],
})
export class AppModule {}
