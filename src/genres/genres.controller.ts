import { Controller, Get, Post, Body, HttpException, ConflictException } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreDocument } from './schemas/genre.schema';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async createGenre(@Body() createGenreDto: GenreDocument) {
    try {
      return await this.genresService.createGenre(createGenreDto);
    } catch (error) {
      //MongoDB unicity error.code === 11000
      if (error.code === 11000) {
        throw new ConflictException('Genre already exists');
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Get()
  async findAllGenres(): Promise<GenreDocument[]> {
    return this.genresService.findAllGenres();
  }
}
