import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SupportDocument } from './schemas/support.schema';

@Injectable()
export class SupportsService {
  constructor(@Inject('SUPPORT_MODEL') private readonly supportModel: Model<SupportDocument>) {}

  async findMoviesBySupportType(support: string): Promise<string[]> {
    const supports = await this.supportModel.findOne({ type: support }).exec();
    return supports.movies;
  }
}
