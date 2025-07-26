import { Controller, Get, Post, Body, HttpException, Param, ConflictException } from '@nestjs/common';
import { NamesService } from './names.service';
import { NameDocument } from './schemas/name.schema';

@Controller('names')
export class NamesController {
  constructor(private readonly namesService: NamesService) {}

  @Post()
  async createName(@Body() createNameDto: NameDocument) {
    try {
      return await this.namesService.createName(createNameDto);
    } catch (error) {
      //MongoDB unicity error.code === 11000
      if (error.code === 11000) {
        throw new ConflictException('Name already exists');
      }
      throw new HttpException(error.message, 500);
    }
  }

  @Get()
  async findAllNames(): Promise<NameDocument[]> {
    return await this.namesService.findAllNames();
  }

  @Get('api-data/:imdbId')
  async getNameFromApi(@Param('imdbId') imdbId: string): Promise<any> {
    return this.namesService.getNameFromRapidApi(imdbId);
  }
}
