import { Body, Controller, Delete, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieDocument } from './schemas/movie.schema';
import { MovieDto } from './dto/movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  async createMovie(@Body() createMovieDto: MovieDto): Promise<MovieDocument> {
    try {
      return await this.moviesService.createMovie(createMovieDto);
    } catch (error) {
      console.log('===>', error);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get(':movieId')
  async findOneMovie(@Param() params: { movieId: string }): Promise<MovieDocument | null> {
    return this.moviesService.findOneMovie(params.movieId);
  }

  @Get()
  async findAllMoviesWithPagination(@Query() query: { start?: number; limit?: number }): Promise<MovieDocument[]> {
    const { start, limit } = query;
    return this.moviesService.findAllMovies(start, limit);
  }

  @Delete(':movieId')
  async deleteMovie(@Param() params: { movieId: string }): Promise<void> {
    try {
      return this.moviesService.deleteMovie(params.movieId);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }
}
