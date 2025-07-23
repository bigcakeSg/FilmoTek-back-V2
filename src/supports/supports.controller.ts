import { Controller, Get, HttpException, Param, Patch } from '@nestjs/common';
import { SupportsService } from './supports.service';

@Controller('supports')
export class SupportsController {
  constructor(private readonly supportsService: SupportsService) {}

  @Get(':support')
  async getMoviesBySupportType(@Param() params: { support: string }): Promise<string[]> {
    return this.supportsService.findMoviesBySupportType(params.support);
  }

  @Patch(':support/add-movie/:movieId')
  async addMovieToSupportType(@Param() params: { support: string; movieId: string }): Promise<void> {
    try {
      this.supportsService.addMovieToSupportType(params.support, params.movieId);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Patch(':support/delete-movie/:movieId')
  async deleteMovieFromSupportType(@Param() params: { support: string; movieId: string }): Promise<void> {
    try {
      this.supportsService.deleteMovieFromSupportType(params.support, params.movieId);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
