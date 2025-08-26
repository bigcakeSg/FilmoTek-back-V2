import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanieDto } from './dto/companie.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async createCompanie(@Body() createCompanieDto: CompanieDto) {
    return await this.companiesService.createCompanie(createCompanieDto);
  }

  @Get()
  async getAllCompanies(): Promise<CompanieDto[]> {
    return await this.companiesService.getAllCompanies();
  }
}
