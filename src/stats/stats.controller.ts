import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Public } from 'src/auth/public.decorator';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get('bysupport')
  getStatsBySupport() {
    return this.statsService.getStatsBySupport();
  }

  @Public()
  @Get('bygenre')
  getStatsByGenre() {
    return this.statsService.getStatsByGenre();
  }

  @Public()
  @Get('bydate')
  getStatsByDate() {
    return this.statsService.getStatsByDate();
  }
}
