import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NamesController } from './names.controller';
import { NamesService } from './names.service';
import { NamesProviders } from './names.providers';
import { DatabaseModule } from '../database/database.module';
import { PicturesService } from 'src/pictures/pictures.service';

@Module({
  imports: [DatabaseModule, HttpModule],
  controllers: [NamesController],
  providers: [NamesService, PicturesService, ...NamesProviders],
})
export class NamesModule {}
