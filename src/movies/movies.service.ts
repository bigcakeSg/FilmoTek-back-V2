import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { MovieDocument } from './schemas/movie.schema';

@Injectable()
export class MoviesService {
  constructor(@Inject('MOVIE_MODEL') private readonly movieModel: Model<MovieDocument>) {}

  async findOneMovie(movieId: string): Promise<MovieDocument | null> {
    return this.movieModel
      .findById(movieId)
      .populate('genres directors.name writers.name casting.principal.name casting.extended.name')
      .exec();
  }

  async findAllMovies(start?: number, limit?: number): Promise<MovieDocument[]> {
    return this.movieModel
      .find()
      .skip(start)
      .limit(limit)
      .populate('genres directors.name writers.name casting.principal.name casting.extended.name')
      .exec();
  }
}
