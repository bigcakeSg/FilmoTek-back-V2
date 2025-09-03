import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Public } from 'src/auth/public.decorator';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get('bysupport')
  getStatsBySupport(): Promise<Record<string, number>> {
    return this.statsService.getStatsBySupport();
  }

  @Public()
  @Get('bygenre')
  getStatsByGenre(): Promise<Record<string, number>> {
    return this.statsService.getStatsByGenre();
  }

  @Public()
  @Get('bydate')
  getStatsByDate(): Promise<Record<string, any>> {
    return this.statsService.getStatsByDate();
  }
}
