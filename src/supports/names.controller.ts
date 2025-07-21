import { Controller, Get, Param } from '@nestjs/common';
import { SupportsService } from './names.service';

@Controller('supports')
export class SupportsController {
  constructor(private readonly supportsService: SupportsService) {}

  @Get(':support')
  async GetMoviesBySupportType(@Param() params: { support: string }): Promise<string[]> {
    return this.supportsService.findMoviesBySupportType(params.support);
  }
}
