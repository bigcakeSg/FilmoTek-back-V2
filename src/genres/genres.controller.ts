import { Controller, Get, Post, Body, HttpException } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreDocument } from './schemas/genre.schema';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async create(@Body() createGenreDto: GenreDocument) {
    try {
      return await this.genresService.create(createGenreDto);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get()
  async findAll(): Promise<GenreDocument[]> {
    return this.genresService.findAll();
  }
}
