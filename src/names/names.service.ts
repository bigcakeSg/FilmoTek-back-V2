import { HttpException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { NameDocument } from './schemas/name.schema';
import { NameInputDto } from './dto/name.dto';
import { PicturesService } from 'src/pictures/pictures.service';

@Injectable()
export class NamesService {
  constructor(
    @Inject('NAME_MODEL') private readonly nameModel: Model<NameDocument>,
    private readonly httpService: HttpService,
    private readonly picturesService: PicturesService,
  ) {}

  async createName(name: NameInputDto): Promise<string> {
    const nameId = await this.nameModel
      .findOne({
        id: name.id,
      })
      .exec();

    if (nameId) return nameId.get('_id').toString();
    else {
      const picture = name.picture
        ? await this.picturesService.savePicture(
            { url: name.picture.url, name: name.text, size: { w: name.picture.width, h: name.picture.height } },
            'portrait',
          )
        : undefined;

      const newName = new this.nameModel({ id: name.id, text: name.text, picture });

      await newName.save();
      return newName.get('_id').toString();
    }
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
