import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateGenreDto } from './dto/create-genre.dto';
import { Genre } from './interfaces/genre.interface';

@Injectable()
export class GenresService {
  constructor(@Inject('GENRE_MODEL') private readonly genreModel: Model<Genre>) {}

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    const createdGenre = this.genreModel.create(createGenreDto);
    return createdGenre;
  }

  async findAll(): Promise<Genre[]> {
    return this.genreModel.find().exec();
  }
}
