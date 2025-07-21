import { Controller, Get, Post, Body } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreDocument } from './schemas/genre.schema';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async create(@Body() createGenreDto: GenreDocument) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  async findAll(): Promise<GenreDocument[]> {
    return this.genresService.findAll();
  }
}
