import { Module } from '@nestjs/common';
import { NamesController } from './names.controller';
import { NamesService } from './names.service';
import { NamesProviders } from './names.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NamesController],
  providers: [NamesService, ...NamesProviders],
})
export class NamesModule {}
