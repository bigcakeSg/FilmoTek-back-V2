import { Controller, Get, Post, Body } from '@nestjs/common';
import { NamesService } from './names.service';
import { NameDocument } from './schemas/name.schema';

@Controller('names')
export class NamesController {
  constructor(private readonly namesService: NamesService) {}

  @Post()
  async create(@Body() createNameDto: NameDocument) {
    return this.namesService.create(createNameDto);
  }

  @Get()
  async findAll(): Promise<NameDocument[]> {
    return this.namesService.findAll();
  }
}
