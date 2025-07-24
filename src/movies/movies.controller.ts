import { Body, Controller, Delete, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieDocument } from './schemas/movie.schema';
import { MovieDto } from './dto/movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post('title')
  async createMovie(@Body() createMovieDto: MovieDto): Promise<MovieDocument> {
    try {
      return await this.moviesService.createMovie(createMovieDto);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('title/:movieId')
  async findOneMovie(@Param() params: { movieId: string }): Promise<MovieDocument | null> {
    return this.moviesService.findOneMovie(params.movieId);
  }

  @Get()
  async findAllMoviesWithPagination(@Query() query: { start?: number; limit?: number }): Promise<MovieDocument[]> {
    const { start, limit } = query;
    return this.moviesService.findAllMovies(start, limit);
  }

  @Delete('title/:movieId')
  async deleteMovie(@Param() params: { movieId: string }): Promise<void> {
    try {
      return this.moviesService.deleteMovie(params.movieId);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get('api-data/title/:imdbId')
  async getDataFromApi(@Param('imdbId') imdbId: string): Promise<MovieDto> {
    return this.moviesService.getMovieFromRapidApi(imdbId);
  }
}
