import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { GenreDocument } from './schemas/genre.schema';

@Injectable()
export class GenresService {
  constructor(@Inject('GENRE_MODEL') private readonly genreModel: Model<GenreDocument>) {}

  async createGenre(createGenreDto: GenreDocument): Promise<GenreDocument> {
    const createdGenre = this.genreModel.create(createGenreDto);
    return createdGenre;
  }

  async findAllGenres(): Promise<GenreDocument[]> {
    return this.genreModel.find().select('-__v').exec();
  }
}
