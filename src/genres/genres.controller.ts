import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenresService } from './genres.service';
import { Genre } from './interfaces/genre.interface';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  async findAll(): Promise<Genre[]> {
    return this.genresService.findAll();
  }
}
