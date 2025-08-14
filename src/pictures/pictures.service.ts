import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { Jimp } from 'jimp';
import { PictureDto, PictureType } from './dto/picture.dto';

@Injectable()
export class PicturesService {
  constructor() {}

  async savePicture(picture: PictureDto, type: PictureType, isThumbnail?: boolean): Promise<string> {
    try {
      const folder = `${type}s${isThumbnail ? '/thumbnails' : ''}`;

      if (!fs.existsSync(`media/${folder}`)) {
        fs.mkdirSync(`media/${folder}`, { recursive: true });
      }

      const image = await Jimp.read(picture.url);
      const fileName: `${string}.${string}` =
        `${picture.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')}.jpg` as `${string}.${string}`;

      const baseName = fileName.split('-')[0];
      const existingFiles = fs.readdirSync(`media/${folder}`);
      existingFiles.forEach((file) => {
        if (file.startsWith(baseName)) {
          fs.unlinkSync(`media/${folder}/${file}`);
        }
      });

      await image.resize({ w: picture.size?.w, h: picture.size?.h }).write(`media/${folder}/${fileName}`);

      return fileName;
    } catch (error) {
      console.log(error.message);
      return;
    }
  }
}
