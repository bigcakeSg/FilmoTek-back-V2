import { ConflictException, HttpException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { Name, NameDocument } from './schemas/name.schema';
import { NameDto } from './dto/name.dto';
import { PicturesService } from 'src/pictures/pictures.service';
import { PictureType } from 'src/pictures/dto/picture.dto';

@Injectable()
export class NamesService {
  constructor(
    @Inject('NAME_MODEL') private readonly nameModel: Model<NameDocument>,
    private readonly httpService: HttpService,
    private readonly picturesService: PicturesService,
  ) {}

  async createName(name: NameDto, isCatchError?: boolean): Promise<Name> {
    const foundName = await this.nameModel
      .findOne({
        id: name.id,
      })
      .select('-__v')
      .exec();

    if (foundName && isCatchError) throw new ConflictException(`"${name.text}" already exists`);
    if (foundName) return foundName;

    const picture = name.picture
      ? await this.picturesService.savePicture(
          { url: name.picture.url, name: name.text, size: { w: name.picture.width, h: name.picture.height } },
          PictureType.PORTRAIT,
        )
      : undefined;

    return await new this.nameModel({ id: name.id, text: name.text, picture }).save();
  }

  async findAllNames(): Promise<NameDocument[]> {
    return await this.nameModel.find().select('-__v').exec();
  }

  async getNameFromRapidApi(imdbId: string): Promise<NameDto> {
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

      return {
        id: response.data.results.nconst,
        text: response.data.results.primaryName,
      };
    } catch (error) {
      throw new HttpException(`Failed to fetch name with imdbId ${imdbId}`, error.response?.status || 500);
    }
  }
}
