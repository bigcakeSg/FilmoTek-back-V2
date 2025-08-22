import { ConflictException, HttpException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CompanieDocument } from './schemas/companie.schema';
import { CompanieDto } from './dto/companie.dto';

@Injectable()
export class CompaniesService {
  constructor(@Inject('COMPANIE_MODEL') private readonly companieModel: Model<CompanieDocument>) {}

  async createCompanie(createCompanieDto: CompanieDto): Promise<CompanieDocument> {
    try {
      return await this.companieModel.create(createCompanieDto);
    } catch (error) {
      //MongoDB unicity error.code === 11000
      if (error.code === 11000) {
        throw new ConflictException(`Companie "${createCompanieDto.id}" already exists`);
      }
      throw new HttpException(error.message, 500);
    }
  }

  async getAllCompanies(): Promise<CompanieDocument[]> {
    return await this.companieModel.find().select('-__v').exec();
  }
}
