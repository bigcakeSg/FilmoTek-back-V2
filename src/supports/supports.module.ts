import { Module } from '@nestjs/common';
import { SupportsController } from './supports.controller';
import { SupportsService } from './supports.service';
import { SupportsProviders } from './supports.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SupportsController],
  providers: [SupportsService, ...SupportsProviders],
})
export class SupportsModule {}
