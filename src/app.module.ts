import { Module } from '@nestjs/common';
import { GenresModule } from './genres/genres.module';
import { NamesModule } from './names/names.module';
import { SupportsModule } from './supports/names.module';

@Module({
  imports: [GenresModule, NamesModule, SupportsModule],
})
export class AppModule {}
