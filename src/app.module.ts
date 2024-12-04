import { Module } from '@nestjs/common';
import { GenresModule } from './genres/genres.module';

@Module({
  imports: [GenresModule],
})
export class AppModule {}
