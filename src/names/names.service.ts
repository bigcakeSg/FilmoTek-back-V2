import { HttpException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { NameDocument } from './schemas/name.schema';

@Injectable()
export class NamesService {
  constructor(
    @Inject('NAME_MODEL') private readonly nameModel: Model<NameDocument>,
    private readonly httpService: HttpService,
  ) {}

  async createName(createNameDto: NameDocument): Promise<NameDocument> {
    return await this.nameModel.create(createNameDto);
  }

  async findAllNames(): Promise<NameDocument[]> {
    return await this.nameModel.find().select('-__v').exec();
  }

  async getNameFromRapidApi(imdbId: string): Promise<NameDocument> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.RAPID_API_URL}/actors/${imdbId}`, {
          headers: {
            'X-RapidAPI-Host': process.env.RAPID_API_HOST,
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          },
          params: {
            limit: '1',
          },
        }),
      );

      return new this.nameModel({
        id: response.data.results.nconst,
        text: response.data.results.primaryName,
      });
    } catch (error) {
      throw new HttpException(`Failed to fetch name with imdbId ${imdbId}`, error.response?.status || 500);
    }
  }
}
