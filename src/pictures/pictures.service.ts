import * as fs from 'fs';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PictureDocument } from './schemas/picture.schema';
import { Jimp } from 'jimp';
import { PictureInputDto, PictureOutputDto } from './dto/picture.dto';

@Injectable()
export class PicturesService {
  constructor(@Inject('PICTURE_MODEL') private readonly pictureModel: Model<PictureDocument>) {}

  async savePicture(picture: PictureInputDto, type: 'poster' | 'portrait'): Promise<PictureOutputDto> {
    try {
      const folder = `media/${type}s`;

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      const image = await Jimp.read(picture.url);
      const fileName: `${string}.${string}` = `${picture.name ? picture.name + '-' : ''}${Date.now()}.jpg`;
      await image.resize({ w: picture.size?.w, h: picture.size?.h }).write(`${folder}/${fileName}`);

      return {
        url: fileName,
        width: picture.size?.w,
        height: picture.size?.h,
      };
    } catch (error) {
      console.log(error.message);
      return;
    }
  }
}
