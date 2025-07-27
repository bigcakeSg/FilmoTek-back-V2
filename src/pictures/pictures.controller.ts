import { Controller, Post, Body, Param } from '@nestjs/common';
import { PicturesService } from './pictures.service';
import { PictureInputDto } from './dto/picture.dto';

@Controller('pictures')
export class PicturesController {
  constructor(private readonly picturesService: PicturesService) {}

  @Post(':type')
  async createPicture(@Param('type') type: 'poster' | 'portrait', @Body() picture: PictureInputDto): Promise<string> {
    return await this.picturesService.savePicture(picture, type);
  }
}
