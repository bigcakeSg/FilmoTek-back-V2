import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NamesService } from './names.service';
import { Name, NameDocument } from './schemas/name.schema';
import { NameDto } from './dto/name.dto';

@Controller('names')
export class NamesController {
  constructor(private readonly namesService: NamesService) {}

  @Post()
  async createName(@Body() createNameDto: NameDto): Promise<Name> {
    return await this.namesService.createName(createNameDto, false);
  }

  @Get()
  async findAllNames(): Promise<NameDocument[]> {
    return await this.namesService.findAllNames();
  }

  @Get('api-data/:imdbId')
  async getNameFromApi(@Param('imdbId') imdbId: string): Promise<NameDto> {
    return this.namesService.getNameFromRapidApi(imdbId);
  }
}
