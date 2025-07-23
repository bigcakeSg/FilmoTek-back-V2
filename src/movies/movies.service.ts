import { Inject, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { MovieDto, Name } from './dto/movie.dto';
import { MovieDocument } from './schemas/movie.schema';
import { GenreDocument } from 'src/genres/schemas/genre.schema';
import { NameDocument } from 'src/names/schemas/name.schema';

@Injectable()
export class MoviesService {
  constructor(
    @Inject('MOVIE_MODEL') private readonly movieModel: Model<MovieDocument>,
    @Inject('GENRE_MODEL') private readonly genreModel: Model<GenreDocument>,
    @Inject('NAME_MODEL') private readonly nameModel: Model<NameDocument>,
  ) {}

  private async newNames(names: { name: Name; attributes?: string[] }[]): Promise<
    {
      name: Types.ObjectId;
      picture?: {
        url: string;
        height?: number;
        width?: number;
      };
      attributes: string[];
    }[]
  > {
    return await Promise.all(
      names.map(async ({ name, attributes }) => {
        const nameId = await this.nameModel
          .exists({
            id: name.id,
          })
          .exec();

        if (nameId) return { name: nameId._id, attributes };
        else {
          const newName = new this.nameModel({ id: name.id, text: name.text, picture: name.picture });
          await newName.save();
          return { name: newName._id, attributes };
        }
      }),
    );
  }

  async createMovie(movieData: MovieDto): Promise<MovieDocument> {
    const genres = await Promise.all(
      movieData.genres.map(async (genre) => {
        const genreId = await this.genreModel
          .exists({
            id: genre.id,
          })
          .exec();

        if (genreId) return genreId._id;
        else {
          const newGenre = new this.genreModel({ id: genre.id, text: genre.text });
          await newGenre.save();
          return newGenre._id;
        }
      }),
    );
    const directors = await this.newNames(movieData.directors);
    const writers = await this.newNames(movieData.writers);
    const principalCast = await this.newNames(movieData.casting.principal);
    const extendedCast = await this.newNames(movieData.casting.extended);

    const createdMovie = new this.movieModel({
      ...movieData,
      genres,
      directors,
      writers,
      casting: { principal: principalCast, extended: extendedCast },
      seen: false,
    });

    return createdMovie.save();
  }

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

  async deleteMovie(movieId): Promise<void> {
    await this.movieModel.deleteOne({ _id: movieId }).exec();
  }
}
