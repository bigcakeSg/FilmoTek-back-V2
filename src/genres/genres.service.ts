import { ConflictException, HttpException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { GenreDocument } from './schemas/genre.schema';
import { GenreDto } from './dto/genre.dto';

@Injectable()
export class GenresService {
  constructor(@Inject('GENRE_MODEL') private readonly genreModel: Model<GenreDocument>) {}

  async createGenre(createGenreDto: GenreDto): Promise<GenreDocument> {
    try {
      return await this.genreModel.create(createGenreDto);
    } catch (error) {
      //MongoDB unicity error.code === 11000
      if (error.code === 11000) {
        throw new ConflictException(`Genre "${createGenreDto.id}" already exists`);
      }
      throw new HttpException(error.message, 500);
    }
  }

  async getAllGenres(): Promise<GenreDocument[]> {
    return await this.genreModel.find().select('-__v').exec();
  }
}
