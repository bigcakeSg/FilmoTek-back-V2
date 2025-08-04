import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieDocument } from './schemas/movie.schema';
import { MovieDto, OutputDto } from './dto/movie.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post('title')
  async createMovie(@Body() createMovieDto: MovieDto): Promise<string> {
    return this.moviesService.createMovie(createMovieDto);
  }

  @Public()
  @Get('title/:movieId')
  async getOneMovie(@Param() params: { movieId: string }): Promise<MovieDocument> {
    return this.moviesService.getOneMovie(params.movieId);
  }

  @Public()
  @Get()
  async getAllMoviesWithPagination(
    @Query()
    query: {
      start?: string;
      limit?: string;
      sortby?:
        | 'releaseDate'
        | 'normalizedOriginalTitle'
        | 'normalizedFrenchTitle'
        | 'normalizedEnglishTitle'
        | 'supports';
      direction?: 'desc' | 'asc';
      filter: string | string[];
      format: 'full' | ' lite';
    },
  ): Promise<OutputDto> {
    const { start, limit, sortby, direction, format, filter } = query;
    return this.moviesService.getAllMovies({ start: +start, limit: +limit, sortby, direction, filter, format });
  }

  @Delete('title/:movieId')
  async deleteMovie(@Param() params: { movieId: string }): Promise<void> {
    return this.moviesService.deleteMovie(params.movieId);
  }

  @Patch('title/:movieId')
  async updateMovie(@Param('movieId') movieId: string, @Body() updateMovieDto: MovieDto): Promise<MovieDocument> {
    return await this.moviesService.updateMovie(movieId, updateMovieDto);
  }

  @Get('api-data/title/:imdbId')
  async getDataFromApi(@Param('imdbId') imdbId: string): Promise<MovieDto> {
    return await this.moviesService.getMovieFromRapidApi(imdbId);
  }

  @Get('export')
  async exportMovies(
    @Query()
    query: {
      start?: string;
      limit?: string;
    },
  ): Promise<unknown> {
    return this.moviesService.exportMovies(query.start ? +query.start : 0, query.limit ? +query.limit : undefined);
  }

  @Post('import')
  async importMovies(
    @Query()
    query: {
      start?: string;
      limit?: string;
    },
  ): Promise<void> {
    return this.moviesService.importMovies(query.start ? +query.start : 0, query.limit ? +query.limit : undefined);
  }
}
