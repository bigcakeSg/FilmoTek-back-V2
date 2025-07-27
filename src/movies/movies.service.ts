import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { filterDto, MovieDto, OutputDto, NameDto } from './dto/movie.dto';
import { MovieDocument } from './schemas/movie.schema';
import { GenreDocument } from 'src/genres/schemas/genre.schema';
import { NameDocument } from 'src/names/schemas/name.schema';
import { PicturesService } from 'src/pictures/pictures.service';
import { NamesService } from 'src/names/names.service';
import { PictureType } from 'src/pictures/dto/picture.dto';
import { normalizeTitle } from 'src/utils/helpers';

@Injectable()
export class MoviesService {
  constructor(
    @Inject('MOVIE_MODEL') private readonly movieModel: Model<MovieDocument>,
    @Inject('GENRE_MODEL') private readonly genreModel: Model<GenreDocument>,
    @Inject('NAME_MODEL') private readonly nameModel: Model<NameDocument>,
    private readonly httpService: HttpService,
    private readonly picturesService: PicturesService,
    private readonly namesService: NamesService,
  ) {}

  private async newNames(names: { name: NameDto; attributes?: string[] }[]): Promise<
    {
      name: NameDto;
      attributes: string[];
    }[]
  > {
    return await Promise.all(
      names.map(async ({ name, attributes }) => {
        const newName = await this.namesService.createName({
          ...name,
          picture: { url: name.picture, width: 600 },
        });
        return { name: newName, attributes };
      }),
    );
  }

  async createMovie(movieData: MovieDto): Promise<string> {
    const isMovieExists = await this.movieModel
      .findOne({
        imdbId: movieData.imdbId,
      })
      .exec();

    if (isMovieExists) {
      throw new ConflictException(
        `Movie with imdbId ${movieData.imdbId} already exists (${isMovieExists.get('_id').toString()}).`,
      );
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

    const picture = await this.picturesService.savePicture(
      { url: movieData.picture, name: movieData.originalTitle, size: { w: 1200 } },
      PictureType.POSTER,
    );

    const createdMovie = new this.movieModel({
      ...movieData,
      picture,
      genres,
      directors,
      writers,
      casting: { principal: principalCast, extended: extendedCast },
      watched: false,
    });

    await createdMovie.save();

    return createdMovie.get('_id').toString();
  }

  async getOneMovie(movieId: string): Promise<MovieDocument> {
    const movie = await this.movieModel
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

    if (!movie) throw new NotFoundException(`Movie "movieId" not found`);

    return movie;
  }

  async getAllMovies(queries: {
    start?: number;
    limit?: number;
    sortby?: string;
    direction?: 'desc' | 'asc';
    filter?: filterDto[];
  }): Promise<OutputDto> {
    const { start, limit, sortby, direction, filter } = queries;
    const filters = Array.isArray(filter)
      ? filter.map((elt) => ({ [elt.filter]: { $regex: elt.value, $options: 'i' } }))
      : null;

    let movies = await this.movieModel
      .aggregate([
        {
          $addFields: {
            releaseDate: {
              $dateFromParts: {
                year: '$releaseDate.year',
                month: '$releaseDate.month',
                day: '$releaseDate.day',
              },
            },
          },
        },
        {
          $addFields: {
            frenchTitle: {
              $let: {
                vars: {
                  frTitleObj: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$regionalTitles',
                          as: 'title',
                          cond: { $eq: ['$$title.region', 'FR'] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: '$$frTitleObj.title',
              },
            },
          },
        },
        // Remove fields
        {
          $project: {
            regionalTitles: 0,
            directors: 0,
            plot: 0,
            genres: 0,
            writers: 0,
            casting: 0,
            __v: 0,
          },
        },
        ...(start ? [{ $skip: start }] : []),
        ...(limit ? [{ $limit: limit }] : []),
        ...(filters ? [{ $match: { $or: filters } }] : []),
      ])
      .exec();

    movies = movies.map((movie) => ({
      ...movie,
      normOriginalTitle: normalizeTitle(movie.originalTitle),
      normFrenchTitle: movie.frenchTitle ? normalizeTitle(movie.frenchTitle) : null,
    }));

    if (sortby) {
      movies = movies.sort((a, b) => {
        const aValue = a[sortby];
        const bValue = b[sortby];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (direction === 'desc') {
            return bValue.localeCompare(aValue);
          }
          return aValue.localeCompare(bValue);
        }
        if (direction === 'desc') {
          return bValue - aValue;
        }
        return aValue - bValue;
      });
    }

    const totalCount = await this.movieModel.countDocuments().exec();

    return {
      count: movies.length,
      totalCount,
      start,
      limit,
      data: movies.map((movie) => ({
        ...movie,
        normOriginalTitle: undefined,
        normFrenchTitle: undefined,
      })),
    };
  }

  async deleteMovie(movieId: string): Promise<void> {
    const isExists = await this.movieModel
      .exists({
        _id: movieId,
      })
      .exec();

    if (!isExists) throw new NotFoundException(`Movie "${movieId}" does not exist`);

    await this.movieModel.deleteOne({ _id: movieId }).exec();
  }

  private formatMovieData = ({ baseInfo, principalCast, extendedCast, creatorsDirectorsWriters, titles }): MovieDto => {
    const regionalTitles = titles.map((title) => ({
      title: title?.title,
      region: title?.region,
    }));

    const picture = baseInfo.primaryImage?.url;

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

    const formatName = (names) => {
      return (
        names.map((name) => ({
          name: {
            id: name.name.id,
            text: name.name.nameText.text,
            picture: name.name?.primaryImage?.url,
          },
          characters: name.characters?.map((char) => char.name) || [],
          attributes: name.attributes?.map((attr) => attr.text) || [],
        })) || []
      );
    };

    const directors = formatName(creatorsDirectorsWriters.directors?.[0]?.credits);
    const writers = formatName(creatorsDirectorsWriters.writers?.[0]?.credits);
    const castingPrincipal = formatName(principalCast.principalCast?.[0]?.credits);
    const castingExtended = formatName(extendedCast.cast?.edges.map(({ node }) => node));

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
      watched: false,
    };
  };

  async getMovieFromRapidApi(imdbId: string): Promise<MovieDto> {
    const params = ['base_info', 'principalCast', 'extendedCast', 'creators_directors_writers'];

    try {
      const [baseInfo, principalCast, extendedCast, creatorsDirectorsWriters, titles] = await Promise.all([
        ...params.map((param) =>
          firstValueFrom(
            this.httpService.get(`${process.env.RAPID_API_URL}/titles/${imdbId}`, {
              headers: {
                'X-RapidAPI-Host': process.env.RAPID_API_HOST,
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
          this.httpService.get(`${process.env.RAPID_API_URL}/titles/${imdbId}/aka`, {
            headers: {
              'X-RapidAPI-Host': process.env.RAPID_API_HOST,
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
    const movie = await this.movieModel.findById(movieId).exec();

    if (!movie) {
      throw new NotFoundException(`Movie "${movieId}" not found`);
    }

    return await this.movieModel
      .findByIdAndUpdate(movieId, updateMovieDto, { new: true })
      .select('imdbId originalTitle regionalTitles picture releaseDate directors watched')
      .populate([{ path: 'directors.name', select: '-__v' }])
      .exec();
  }

  async getMoviesByGenre(genreId: string): Promise<MovieDocument[]> {
    return await this.movieModel
      .find({ genres: genreId })
      .select('imdbId originalTitle regionalTitles picture releaseDate')
      .sort('originalTitle')
      .exec();
  }

  async getMoviesByName(nameId: string): Promise<MovieDocument[]> {
    return await this.movieModel
      .find({
        $or: [
          { 'directors.name': nameId },
          { 'writers.name': nameId },
          { 'casting.principal.name': nameId },
          { 'casting.extended.name': nameId },
        ],
      })
      .select('imdbId originalTitle regionalTitles picture releaseDate directors watched')
      .populate([{ path: 'directors.name', select: '-__v' }])
      .sort('originalTitle')
      .select('-__v')
      .exec();
  }
}
