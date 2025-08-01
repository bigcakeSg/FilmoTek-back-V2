import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersProviders } from './users.provider';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, ...UsersProviders],
  exports: [UsersService, ...UsersProviders],
})
export class UsersModule {}
