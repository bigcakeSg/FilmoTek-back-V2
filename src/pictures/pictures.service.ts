import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { Jimp } from 'jimp';
import { PictureInputDto } from './dto/picture.dto';

@Injectable()
export class PicturesService {
  constructor() {}

  async savePicture(picture: PictureInputDto, type: 'poster' | 'portrait'): Promise<string> {
    try {
      const folder = `media/${type}s`;

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      const image = await Jimp.read(picture.url);
      const fileName: `${string}.${string}` = `${picture.name ? picture.name + '-' : ''}${Date.now()}.jpg`;
      await image.resize({ w: picture.size?.w, h: picture.size?.h }).write(`${folder}/${fileName}`);

      return fileName;
    } catch (error) {
      console.log(error.message);
      return;
    }
  }
}
