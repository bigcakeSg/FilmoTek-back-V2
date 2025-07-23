import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieDocument } from './schemas/movie.schema';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get(':movieId')
  async findOneMovie(@Param() params: { movieId: string }): Promise<MovieDocument | null> {
    return this.moviesService.findOneMovie(params.movieId);
  }

  @Get()
  async findAllMoviesWithPagination(@Query() query: { start?: number; limit?: number }): Promise<MovieDocument[]> {
    const { start, limit } = query;
    return this.moviesService.findAllMovies(start, limit);
  }
}
