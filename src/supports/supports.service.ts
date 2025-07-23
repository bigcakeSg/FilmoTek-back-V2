import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SupportDocument } from './schemas/support.schema';

@Injectable()
export class SupportsService {
  constructor(@Inject('SUPPORT_MODEL') private readonly supportModel: Model<SupportDocument>) {}

  async findMoviesBySupportType(support: string): Promise<string[]> {
    const supports = await this.supportModel.findOne({ type: support }).select('-__v').exec();
    return supports.movies;
  }

  async addMovieToSupportType(support: string, movieId: string): Promise<void> {
    await this.supportModel.updateOne({ type: support }, { $addToSet: { movies: movieId } }).exec();
  }

  async deleteMovieFromSupportType(support: string, movieId: string): Promise<void> {
    await this.supportModel.updateOne({ type: support }, { $pull: { movies: movieId } }).exec();
  }
}
