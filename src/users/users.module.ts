import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { NamesProviders } from './users.provider';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, ...NamesProviders],
  exports: [UsersService],
})
export class UsersModule {}
