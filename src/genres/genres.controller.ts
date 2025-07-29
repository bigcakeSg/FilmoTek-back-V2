import { Controller, Get, Post, Body } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreDto } from './dto/genre.dto';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async createGenre(@Body() createGenreDto: GenreDto) {
    return await this.genresService.createGenre(createGenreDto);
  }

  @Get()
  async findAllGenres(): Promise<GenreDto[]> {
    return await this.genresService.findAllGenres();
  }
}
