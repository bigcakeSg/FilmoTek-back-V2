import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { Jimp } from 'jimp';
import { PictureDto, PictureType } from './dto/picture.dto';

@Injectable()
export class PicturesService {
  constructor() {}

  async savePicture(picture: PictureDto, type: PictureType): Promise<string> {
    try {
      const folder = `media/${type}s`;

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      const image = await Jimp.read(picture.url);
      const fileName: `${string}.${string}` = `${type}s/${picture.name ? picture.name.replace(/\s+/g, '') + '-' : ''}${Date.now()}.jpg`;
      await image.resize({ w: picture.size?.w, h: picture.size?.h }).write(`media/${fileName}`);

      return fileName;
    } catch (error) {
      console.log(error.message);
      return;
    }
  }
}
