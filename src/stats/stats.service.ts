import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { GenresService } from 'src/genres/genres.service';
import { MovieDocument } from 'src/movies/schemas/movie.schema';

@Injectable()
export class StatsService {
  constructor(
    @Inject('MOVIE_MODEL') private readonly movieModel: Model<MovieDocument>,
    private readonly genresService: GenresService,
  ) {}

  async getStatsBySupport(): Promise<Record<string, number>> {
    const movies = await this.movieModel.find().exec();

    const groupedSupports = movies.reduce((acc, movie) => {
      for (const support of movie.supports) {
        acc[support] = acc[support] ? acc[support] + 1 : 1;
      }
      return acc;
    }, {});

    return groupedSupports;
  }

  async getStatsByGenre(): Promise<Record<string, number>> {
    const movies = await this.movieModel.find().exec();
    const services = await this.genresService.getAllGenres();

    const groupedGenres = movies.reduce((acc, movie) => {
      for (const genre of movie.genres) {
        const genreDoc = services.find((g) => g._id.toString() === genre.toString());
        const genreKey = genreDoc ? genreDoc.text : genre.toString();
        acc[genreKey] = acc[genreKey] ? acc[genreKey] + 1 : 1;
      }
      return acc;
    }, {});

    const sortedGenres = Object.keys(groupedGenres)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = groupedGenres[key];
        return acc;
      }, {});

    return sortedGenres;
  }

  async getStatsByDate(): Promise<Record<string, any>> {
    const movies = await this.movieModel.find().exec();
    const services = await this.genresService.getAllGenres();

    const groupedYears = movies.reduce((acc, movie) => {
      const year = new Date(movie.releaseDate).getFullYear();

      acc[year] = acc[year] || {};
      acc[year].total = (acc[year].total || 0) + 1;
      for (const support of movie.supports) {
        acc[year].supports = acc[year].supports || {};
        acc[year].supports[support] = acc[year].supports[support] ? acc[year].supports[support] + 1 : 1;
      }

      for (const genre of movie.genres) {
        const genreDoc = services.find((g) => g._id.toString() === genre.toString());
        const genreKey = genreDoc ? genreDoc.text : genre.toString();
        acc[year].genres = acc[year].genres || {};
        acc[year].genres[genreKey] = acc[year].genres[genreKey] ? acc[year].genres[genreKey] + 1 : 1;
      }

      const sortedGenres = Object.keys(acc[year].genres)
        .sort((a, b) => a.localeCompare(b))
        .reduce((obj, key) => {
          obj[key] = acc[year].genres[key];
          return obj;
        }, {});

      acc[year].genres = sortedGenres;

      return acc;
    }, {});

    return groupedYears;
  }

  async getStatsDuration(): Promise<number> {
    const movies = await this.movieModel.find().exec();
    const totalDuration = movies.reduce((acc, movie) => acc + (movie.duration || 0), 0);
    return totalDuration;
  }
}
