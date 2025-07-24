import { HttpException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
    private readonly httpService: HttpService,
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
    const isMovieExists = await this.movieModel
      .exists({
        imdbId: movieData.imdbId,
      })
      .exec();

    if (isMovieExists) {
      throw new HttpException(`Movie with imdbId ${movieData.imdbId} already exists.`, 409);
    }

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
      .select('imdbId originalTitle regionalTitles picture releaseDate directors seen')
      .sort('originalTitle')
      .skip(start)
      .limit(limit)
      .populate([{ path: 'directors.name', select: '-__v' }])
      .exec();
  }

  async deleteMovie(movieId): Promise<void> {
    await this.movieModel.deleteOne({ _id: movieId }).exec();
  }

  private formatMovieData = ({ baseInfo, principalCast, extendedCast, creatorsDirectorsWriters, titles }) => {
    const regionalTitles = titles.map((title) => ({
      title: title?.title,
      region: title?.region,
    }));

    const picture = {
      url: baseInfo.primaryImage?.url,
      height: baseInfo.primaryImage?.height,
      width: baseInfo.primaryImage?.width,
    };

    const releaseDate = {
      year: baseInfo.releaseYear?.year || null,
      month: baseInfo.releaseDate?.month,
      day: baseInfo.releaseDate?.day,
    };

    const genres =
      baseInfo.genres?.genres.map((genre) => ({
        id: genre?.id,
        text: genre?.text,
      })) || [];

    const directors =
      creatorsDirectorsWriters.directors?.[0]?.credits.map((credit) => ({
        name: { id: credit.name.id, text: credit.name.nameText.text },
        attributes: credit?.attributes?.map((attr) => attr.text) || [],
      })) || [];

    const writers =
      creatorsDirectorsWriters.writers?.[0]?.credits.map((credit) => ({
        name: { id: credit.name.id, text: credit.name.nameText.text },
        attributes: credit?.attributes?.map((attr) => attr.text) || [],
      })) || [];

    const castingPrincipal =
      principalCast.principalCast?.[0]?.credits.map((cast) => ({
        name: {
          id: cast.name.id,
          text: cast.name.nameText.text,
          picture: {
            url: cast.name?.primaryImage?.url,
            height: cast.name?.primaryImage?.height,
            width: cast.name?.primaryImage?.width,
          },
        },
        characters: cast?.characters?.map((char) => char.name) || [],
        attributes: cast?.attributes?.map((attr) => attr.text) || [],
      })) || [];

    const castingExtended = extendedCast.cast?.edges.map(({ node }) => ({
      name: {
        id: node.name.id,
        text: node.name.nameText.text,
        picture: {
          url: node.name?.primaryImage?.url,
          height: node.name?.primaryImage?.height,
          width: node.name?.primaryImage?.width,
        },
      },
      characters: node.characters?.map((char) => char.name) || [],
      attributes: node?.attributes?.map((attr) => attr.text) || [],
    }));

    return {
      imdbId: baseInfo.id,
      originalTitle: baseInfo.originalTitleText.text,
      regionalTitles,
      picture,
      releaseDate,
      duration: baseInfo.runtime?.seconds,
      plot: baseInfo.plot?.plotText?.plainText,
      genres,
      directors,
      writers,
      casting: {
        principal: castingPrincipal,
        extended: castingExtended,
      },
      seen: false,
    };
  };

  async getMovieFromRapidApi(imdbId): Promise<MovieDto> {
    const url = 'https://moviesdatabase.p.rapidapi.com';
    const params = ['base_info', 'principalCast', 'extendedCast', 'creators_directors_writers'];

    try {
      const [baseInfo, principalCast, extendedCast, creatorsDirectorsWriters, titles] = await Promise.all([
        ...params.map((param) =>
          firstValueFrom(
            this.httpService.get(`${url}/titles/${imdbId}`, {
              headers: {
                'X-RapidAPI-Host': 'moviesdatabase.p.rapidapi.com',
                'X-RapidAPI-Key': process.env.RAPID_API_KEY,
              },
              params: {
                limit: '1',
                info: param,
              },
            }),
          ),
        ),
        firstValueFrom(
          this.httpService.get(`${url}/titles/${imdbId}/aka`, {
            headers: {
              'X-RapidAPI-Host': 'moviesdatabase.p.rapidapi.com',
              'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            },
            params: {
              limit: '1',
            },
          }),
        ),
      ]);

      return this.formatMovieData({
        baseInfo: baseInfo.data.results,
        principalCast: principalCast.data.results,
        extendedCast: extendedCast.data.results,
        creatorsDirectorsWriters: creatorsDirectorsWriters.data.results,
        titles: titles.data.results,
      });
    } catch (error) {
      throw new HttpException(`Failed to fetch movie with imdbId ${imdbId}`, error.response?.status || 500);
    }
  }

  async updateMovie(movieId, updateMovieDto): Promise<MovieDocument> {
    try {
      const movie = await this.movieModel.findById(movieId);
      if (!movie) {
        throw new HttpException('Movie not found', 404);
      }

      return await this.movieModel
        .findByIdAndUpdate(movieId, updateMovieDto, { new: true })
        .select('imdbId originalTitle regionalTitles picture releaseDate directors seen')
        .populate([{ path: 'directors.name', select: '-__v' }]);
    } catch (error) {
      throw new HttpException(`Failed to update movie with id ${movieId}`, error.response?.status || 500);
    }
  }
}
