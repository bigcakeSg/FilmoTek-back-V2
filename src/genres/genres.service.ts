import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { GenreDocument } from './schemas/genre.schema';

@Injectable()
export class GenresService {
  constructor(@Inject('GENRE_MODEL') private readonly genreModel: Model<GenreDocument>) {}

  async create(createGenreDto: GenreDocument): Promise<GenreDocument> {
    const createdGenre = this.genreModel.create(createGenreDto);
    return createdGenre;
  }

  async findAll(): Promise<GenreDocument[]> {
    return this.genreModel.find().exec();
  }
}
