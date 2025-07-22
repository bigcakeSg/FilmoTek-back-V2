import { Module } from '@nestjs/common';
import { SupportsController } from './names.controller';
import { SupportsService } from './names.service';
import { SupportsProviders } from './names.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SupportsController],
  providers: [SupportsService, ...SupportsProviders],
})
export class SupportsModule {}
