import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { MovieDocument } from 'src/movies/schemas/movie.schema';

@Injectable()
export class StatsService {
  constructor(@Inject('MOVIE_MODEL') private readonly movieModel: Model<MovieDocument>) {}

  async getStatsBySupport() {
    return { vhs: 200, ld: 50, dvd: 100, bd: 150, uhd: 300 };
  }

  getStatsByGenre() {
    return { action: 300, drama: 250 };
  }

  getStatsByDate() {
    return {
      1942: { vhs: 200, ld: 50, dvd: 100, bd: 150, uhd: 300 },
      1943: { vhs: 150, ld: 75, dvd: 125, bd: 175, uhd: 225 },
    };
  }
}
