import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { CollectionsProviders } from './collections.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, ...CollectionsProviders],
})
export class CollectionsModule {}
