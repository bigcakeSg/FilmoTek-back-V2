import { Controller, Get, Post, Body, HttpException } from '@nestjs/common';
import { NamesService } from './names.service';
import { NameDocument } from './schemas/name.schema';

@Controller('names')
export class NamesController {
  constructor(private readonly namesService: NamesService) {}

  @Post()
  async create(@Body() createNameDto: NameDocument) {
    try {
      return this.namesService.create(createNameDto);
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get()
  async findAll(): Promise<NameDocument[]> {
    return this.namesService.findAll();
  }
}
