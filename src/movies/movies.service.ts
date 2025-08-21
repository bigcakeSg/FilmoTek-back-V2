import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { MovieDto, OutputDto, NameDto } from './dto/movie.dto';
import { MovieDocument } from './schemas/movie.schema';
import { GenreDocument } from 'src/genres/schemas/genre.schema';
import { PicturesService } from 'src/pictures/pictures.service';
import { NamesService } from 'src/names/names.service';
import { CollectionsService } from 'src/collections/collections.service';
import { PictureType } from 'src/pictures/dto/picture.dto';
import { normalizeTitle } from 'src/utils/helpers';
import * as fs from 'fs';
@Injectable()
export class MoviesService {
  constructor(
    @Inject('MOVIE_MODEL') private readonly movieModel: Model<MovieDocument>,
    @Inject('GENRE_MODEL') private readonly genreModel: Model<GenreDocument>,
    private readonly httpService: HttpService,
    private readonly picturesService: PicturesService,
    private readonly namesService: NamesService,
    private readonly collectionsService: CollectionsService,
  ) {}

  private async newNames(names: { name: NameDto; characters?: string[]; attributes?: string[] }[]): Promise<
    {
      name: NameDto;
      characters?: string[];
      attributes: string[];
    }[]
  > {
    return await Promise.all(
      names.map(async ({ name, characters, attributes }) => {
        const newName = await this.namesService.createName({
          ...name,
          picture: { url: name.picture, width: 600 },
        });
        return { name: newName, ...(characters ? { characters } : {}), attributes };
      }),
    );
  }

  private readonly formatMovieData = ({ baseInfo, cast, creatorsDirectorsWriters, titles }): MovieDto => {
    const regionalTitles = titles.map((title) => ({
      title: title?.title,
      region: title?.region,
    }));

    const picture = baseInfo.primaryImage?.url;

    const releaseDate = new Date(
      baseInfo.releaseDate?.year,
      baseInfo.releaseDate?.month - 1,
      baseInfo.releaseDate?.day,
    ).toISOString();

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
    const casting = formatName(cast.principalCast?.[0]?.credits);

    return {
      imdbId: baseInfo.id,
      originalTitle: baseInfo.originalTitleText.text,
      frenchTitle: regionalTitles.find((title) => title.region === 'FR')?.title || undefined,
      englishTitle: regionalTitles.find((title) => title.region === 'GB')?.title || undefined,
      picture,
      releaseDate,
      duration: baseInfo.runtime?.seconds,
      plot: baseInfo.plot?.plotText?.plainText,
      countriesOfOrigin: [],
      spokenLanguages: [],
      companies: [],
      genres,
      directors,
      writers,
      casting,
      supports: baseInfo.supports,
      videos: [],
      collections: [],
    };
  };

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
    const casting = await this.newNames(movieData.casting);
    // const principalCast = await this.newNames(movieData.casting.principal);
    // const extendedCast = await this.newNames(movieData.casting.extended);

    const picture = await this.picturesService.savePicture(
      { url: movieData.picture, name: movieData.imdbId, size: { h: 800 } },
      PictureType.POSTER,
    );
    await this.picturesService.savePicture(
      { url: movieData.picture, name: movieData.imdbId, size: { h: 400 } },
      PictureType.POSTER,
      true,
    );

    const createdMovie = new this.movieModel({
      ...movieData,
      frenchTitle: movieData.frenchTitle ?? movieData.originalTitle,
      englishTitle: movieData.englishTitle ?? movieData.originalTitle,
      normalizedOriginalTitle: normalizeTitle(movieData.originalTitle),
      normalizedFrenchTitle: normalizeTitle(movieData.frenchTitle ?? movieData.originalTitle),
      normalizedEnglishTitle: normalizeTitle(movieData.englishTitle ?? movieData.originalTitle),
      picture,
      genres,
      directors,
      writers,
      casting,
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
        { path: 'casting.name', select: '-__v' },
      ])
      .select('-__v')
      .exec();

    if (!movie) throw new NotFoundException(`Movie "movieId" not found`);

    return movie;
  }

  async getAllMovies(queries: {
    start?: number;
    limit?: number;
    sortby?:
      | 'releaseDate'
      | 'normalizedOriginalTitle'
      | 'normalizedFrenchTitle'
      | 'normalizedEnglishTitle'
      | 'supports';
    direction?: 'desc' | 'asc';
    filter?: string | string[];
    format?: 'full' | ' lite';
  }): Promise<OutputDto> {
    const { start, limit, sortby, direction, filter = [], format } = queries;

    const newFilter = Array.isArray(filter) ? filter : [filter];
    const filterList = newFilter.map((f) => {
      const splitFilter = decodeURIComponent(f).split('+');
      const name = splitFilter[0];
      const value = splitFilter[1];

      if (name === 'genre') return [{ genres: value }];
      if (name === 'support') return value.split(',').map((v) => ({ supports: v }));
      if (name === 'collection') {
        return value.split(',').map((v) => ({ collections: v }));
      }
      if (name === 'notcollection') return value.split(',').map((v) => ({ collections: { $ne: v } }));
      if (name === 'name') return [{ 'directors.name': value }, { 'writers.name': value }, { 'casting.name': value }];
      if (name === 'title')
        return [
          { originalTitle: { $regex: value, $options: 'i' } },
          { frenchTitle: { $regex: value, $options: 'i' } },
          { englishTitle: { $regex: value, $options: 'i' } },
          { normalizedOriginalTitle: { $regex: value, $options: 'i' } },
          { normalizedFrenchTitle: { $regex: value, $options: 'i' } },
          { normalizedEnglishTitle: { $regex: value, $options: 'i' } },
        ];
    });

    const anyFilterListe = [];
    const collectionsFilterList = [[]];

    filterList.forEach((item) => {
      if (Object.keys(item[0])[0] === 'collections')
        collectionsFilterList[0].push(
          ...item.map((i: any) => ({
            collections: i.collections,
          })),
        );
      else anyFilterListe.push(item);
    });

    const filters = { $and: anyFilterListe.concat(collectionsFilterList).map((item) => ({ $or: item })) };

    const select =
      format === 'full'
        ? 'imdbId originalTitle frenchTitle englishTitle picture releaseDate duration plot genres supports videos collections'
        : 'imdbId originalTitle frenchTitle englishTitle picture releaseDate collections';

    let secondarySort;
    switch (sortby) {
      case 'releaseDate':
        secondarySort = { normalizedOriginalTitle: 1 };
        break;
      case 'normalizedOriginalTitle':
      case 'normalizedFrenchTitle':
        secondarySort = { releaseDate: 1 };
        break;
      default:
        secondarySort = {};
        break;
    }

    const movies = await this.movieModel
      .find(filters)
      .sort(
        sortby
          ? {
              [sortby]: direction === 'desc' ? -1 : 1,
              ...secondarySort,
              _id: 1,
            }
          : {},
      )
      .select(select)
      .limit(limit || undefined)
      .skip(start || 0)
      .populate(
        format === 'full'
          ? [
              { path: 'genres', select: '-__v' },
              { path: 'directors.name', select: '-__v' },
              { path: 'writers.name', select: '-__v' },
              { path: 'casting.name', select: '-__v' },
            ]
          : [],
      )
      .exec();

    const filterCount = await this.movieModel.find(filters).select(select).countDocuments().exec();

    const totalCount = await this.movieModel.countDocuments().exec();

    return {
      totalCount,
      filterCount,
      countToEnd:
        filterCount - (start || 0) - (limit || filterCount) < 0
          ? 0
          : filterCount - (start || 0) - (limit || filterCount),
      start: start || 0,
      limit,
      data: movies,
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

  async getMovieFromMoviesDataBaseApi(imdbId: string): Promise<MovieDto> {
    const params = ['base_info', 'principalCast', 'extendedCast', 'creators_directors_writers'];

    try {
      const [baseInfo, principalCast, extendedCast, creatorsDirectorsWriters, titles] = await Promise.all([
        ...params.map((param) =>
          firstValueFrom(
            this.httpService.get(`${process.env.RAPID_API_MOVIESDATABASE_URL}/titles/${imdbId}`, {
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
          this.httpService.get(`${process.env.RAPID_API_MOVIESDATABASE_URL}/titles/${imdbId}/aka`, {
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
        cast: [...principalCast.data.results, ...extendedCast.data.results],
        creatorsDirectorsWriters: creatorsDirectorsWriters.data.results,
        titles: titles.data.results,
      });
    } catch (error) {
      throw new HttpException(`Failed to fetch movie with imdbId ${imdbId}`, error.response?.status || 500);
    }
  }

  async getMovieFromImdbApi(imdbId: string): Promise<MovieDto> {
    const result = await firstValueFrom(
      this.httpService.get(`${process.env.RAPID_API_IMDB_URL}/${imdbId}`, {
        headers: {
          'X-RapidAPI-Host': process.env.RAPID_API_IMDB_HOST,
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        },
      }),
    );

    const movieData = {
      imdbId: result.data.id,
      originalTitle: result.data.originalTitle,
      frenchTitle: result.data.originalTitle,
      englishTitle: result.data.primaryTitle,
      picture: result.data.primaryImage,
      releaseDate: new Date(result.data.releaseDate).toISOString(),
      duration: result.data.runtimeMinutes,
      plot: result.data.description,
      countriesOfOrigin: result.data.countriesOfOrigin,
      spokenLanguages: result.data.spokenLanguages,
      companies: result.data.productionCompanies,
      genres: result.data.genres.map((genre) => ({
        id: genre,
        text: genre,
      })),
      directors: result.data.directors.map((director) => ({
        name: {
          id: director.id,
          text: director.fullName,
        },
      })),
      writers: result.data.writers.map((writer) => ({
        name: {
          id: writer.id,
          text: writer.fullName,
        },
      })),
      casting: result.data.cast.map((castMember) => ({
        name: {
          id: castMember.id,
          text: castMember.fullName,
          picture: castMember.primaryImage,
        },
        characters: castMember.characters,
      })),
      supports: [],
      videos: [result.data.trailer],
      collections: [],
    };

    return movieData;
  }

  async updateMovie(movieId, updateMovieDto): Promise<MovieDocument> {
    const movie = await this.movieModel.findById(movieId).exec();

    if (!movie) {
      throw new NotFoundException(`Movie "${movieId}" not found`);
    }

    return await this.movieModel
      .findByIdAndUpdate(movieId, updateMovieDto, { new: true })
      .select(
        'imdbId originalTitle frenchTitle englishTitle picture releaseDate duration plot genres supports videos collections',
      )
      .populate([
        { path: 'genres', select: '-__v' },
        { path: 'directors.name', select: '-__v' },
        { path: 'writers.name', select: '-__v' },
        { path: 'casting.name', select: '-__v' },
      ])
      .exec();
  }

  async exportMovies(start: number, limit?: number): Promise<unknown> {
    const moviesFilePath = 'backup/FilmoTEKdb.movies.json';
    const genresFilePath = 'backup/FilmoTEKdb.genres.json';
    const namesFilePath = 'backup/FilmoTEKdb.names.json';
    const supportsFilePath = 'backup/FilmoTEKdb.supports.json';

    if (
      !fs.existsSync(moviesFilePath) ||
      !fs.existsSync(genresFilePath) ||
      !fs.existsSync(namesFilePath) ||
      !fs.existsSync(supportsFilePath)
    ) {
      throw new NotFoundException('Exported file not found');
    }

    const movies = fs.readFileSync(moviesFilePath, 'utf-8');
    const importMovies = JSON.parse(movies) as any[];

    const genres = fs.readFileSync(genresFilePath, 'utf-8');
    const importGenres = JSON.parse(genres) as any[];

    const names = fs.readFileSync(namesFilePath, 'utf-8');
    const importNames = JSON.parse(names) as any[];

    const supports = fs.readFileSync(supportsFilePath, 'utf-8');
    const importSupports = JSON.parse(supports) as any[];

    const watched = await this.collectionsService.getOneCollectionByName('collection.watched');

    const newMovies = importMovies.slice(start, limit).map((movie) => {
      const newSupports = [];
      importSupports.forEach((s) => {
        if (s.movies.includes(movie._id.$oid)) newSupports.push(s.type);
      });

      return {
        imdbId: movie.imdbId,
        originalTitle: movie.originalTitle,
        frenchTitle: movie.regionalTitles.find((title) => title.region === 'FR')?.title || undefined,
        englishTitle: movie.regionalTitles.find((title) => title.region === 'GB')?.title || undefined,
        picture: movie.picture.url,
        releaseDate: new Date(movie.releaseDate.year, movie.releaseDate.month - 1, movie.releaseDate.day).toISOString(),
        duration: movie.duration,
        plot: movie.plot,
        genres: movie.genres.map((genre) => {
          const genreData = importGenres.find((g) => g._id.$oid === genre.$oid);
          return { id: genreData.id, text: genreData.text };
        }),
        directors: movie.directors.map((director) => {
          const nameData = importNames.find((n) => n._id.$oid === director.name.$oid);
          return {
            name: {
              id: nameData.id,
              text: nameData.text,
              picture: nameData.picture?.url,
            },
            attributes: director.attributes || [],
          };
        }),
        writers: movie.writers.map((writer) => {
          const nameData = importNames.find((n) => n._id.$oid === writer.name.$oid);
          return {
            name: {
              id: nameData.id,
              text: nameData.text,
              picture: nameData.picture?.url,
            },
            attributes: writer.attributes || [],
          };
        }),
        casting: {
          principal: movie.casting.principal.map((cast) => {
            const nameData = importNames.find((n) => n._id.$oid === cast.name.$oid);
            return {
              name: {
                id: nameData.id,
                text: nameData.text,
                picture: nameData.picture?.url,
              },
              characters: cast.characters || [],
              attributes: cast.attributes || [],
            };
          }),
          extended: movie.casting.extended.map((cast) => {
            const nameData = importNames.find((n) => n._id.$oid === cast.name.$oid);
            return {
              name: {
                id: nameData.id,
                text: nameData.text,
                picture: nameData.picture?.url,
              },
              characters: cast.characters || [],
              attributes: cast.attributes || [],
            };
          }),
        },
        supports: newSupports,
        videos: movie.videos || [],
        collections: movie.seen ? [watched._id] : [],
      };
    });

    fs.writeFileSync('backup/exportedMovies.json', JSON.stringify(newMovies, null, 2));

    return newMovies;
  }

  async importMovies(start: number, limit?: number): Promise<void> {
    const filePath = 'backup/exportedMovies.json';

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Exported movies file not found');
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const moviesData = JSON.parse(fileContent).slice(start, limit) as any[];

    for (const movieData of moviesData) {
      try {
        await this.createMovie(movieData);
      } catch (error) {
        console.error(`Error importing movie with imdbId ${movieData.imdbId}:`, error.message);
      }
    }
  }
}
