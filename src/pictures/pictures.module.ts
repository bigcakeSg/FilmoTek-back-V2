import { Module } from '@nestjs/common';
import { PicturesController } from './pictures.controller';
import { PicturesService } from './pictures.service';
import { PicturesProviders } from './pictures.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PicturesController],
  providers: [PicturesService, ...PicturesProviders],
})
export class PicturesModule {}
