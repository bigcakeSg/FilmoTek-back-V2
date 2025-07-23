import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { MovieDocument } from './schemas/movie.schema';

@Injectable()
export class MoviesService {
  constructor(@Inject('MOVIE_MODEL') private readonly movieModel: Model<MovieDocument>) {}

  async findOneMovie(movieId: string): Promise<MovieDocument | null> {
    return this.movieModel
      .findById(movieId)
      .populate([
        { path: 'genres', select: '-__v' },
        { path: 'directors.name', select: '-__v' },
        { path: 'writers.name', select: '-__v' },
        { path: 'casting.principal.name', select: '-__v' },
        { path: 'casting.extended.name', select: '-__v' },
      ])
      .select('-__v')
      .exec();
  }

  async findAllMovies(start?: number, limit?: number): Promise<MovieDocument[]> {
    return this.movieModel
      .find()
      .skip(start)
      .limit(limit)
      .populate([
        { path: 'genres', select: '-__v' },
        { path: 'directors.name', select: '-__v' },
        { path: 'writers.name', select: '-__v' },
        { path: 'casting.principal.name', select: '-__v' },
        { path: 'casting.extended.name', select: '-__v' },
      ])
      .select('-__v')
      .exec();
  }
}
