import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieDocument } from './schemas/movie.schema';
import { MovieDto, MoviesOutputDto } from './dto/movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post('title')
  async createMovie(@Body() createMovieDto: MovieDto): Promise<string> {
    return this.moviesService.createMovie(createMovieDto);
  }

  @Get('title/:movieId')
  async getOneMovie(@Param() params: { movieId: string }): Promise<MovieDocument> {
    return this.moviesService.getOneMovie(params.movieId);
  }

  @Get()
  async getAllMoviesWithPagination(@Query() query: { start?: number; limit?: number }): Promise<MoviesOutputDto> {
    const { start, limit } = query;
    return this.moviesService.getAllMovies(start, limit);
  }

  @Delete('title/:movieId')
  async deleteMovie(@Param() params: { movieId: string }): Promise<void> {
    return this.moviesService.deleteMovie(params.movieId);
  }

  @Get('api-data/title/:imdbId')
  async getDataFromApi(@Param('imdbId') imdbId: string): Promise<MovieDto> {
    return await this.moviesService.getMovieFromRapidApi(imdbId);
  }

  @Patch('title/:movieId')
  async updateMovie(@Param('movieId') movieId: string, @Body() updateMovieDto: MovieDto): Promise<MovieDocument> {
    return await this.moviesService.updateMovie(movieId, updateMovieDto);
  }

  @Get('genre/:genreId')
  async getMoviesByGenre(@Param('genreId') genreId: string): Promise<MovieDocument[]> {
    return await this.moviesService.getMoviesByGenre(genreId);
  }

  @Get('name/:nameId')
  async getMoviesByName(@Param('nameId') nameId: string): Promise<MovieDocument[]> {
    return await this.moviesService.getMoviesByName(nameId);
  }
}
