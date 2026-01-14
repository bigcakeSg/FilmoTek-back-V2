import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { MovieDto, OutputDto, NameDto } from './dto/movie.dto';
import { MovieDocument } from './schemas/movie.schema';
import { GenreDocument } from 'src/genres/schemas/genre.schema';
import { CompanieDocument } from 'src/companies/schemas/companie.schema';
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
    @Inject('COMPANIE_MODEL') private readonly companieModel: Model<CompanieDocument>,
    private readonly httpService: HttpService,
    private readonly picturesService: PicturesService,
    private readonly namesService: NamesService,
    private readonly collectionsService: CollectionsService,
  ) {}

  private prepareFilters(filter: string | string[]): unknown {
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
      if (name === 'name') return [{ 'casting.name': value }];
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

    return { $and: anyFilterListe.concat(collectionsFilterList).map((item) => ({ $or: item })) };
  }

  private async newNames(names: { name: NameDto; characters?: string[]; job?: string }[]): Promise<
    {
      name: NameDto;
      characters?: string[];
      job?: string;
    }[]
  > {
    const result = [];
    for (const { name, characters, job } of names) {
      console.log('Creating new name:', name.text, job);
      const newName = await this.namesService.createName({
        ...name,
        picture: { url: name.picture, width: 400 },
      });
      result.push({ name: newName, ...(characters ? { characters } : {}), job });
    }
    return result;
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
      [...new Map(movieData.genres.map((item) => [item.id, item])).values()].map(async (genre) => {
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

    const companies = await Promise.all(
      [...new Map(movieData.companies.map((item) => [item.id, item])).values()].map(async (company) => {
        const companyId = await this.companieModel
          .exists({
            id: company.id,
          })
          .exec();

        if (companyId) return companyId._id;
        else {
          const newCompany = new this.companieModel({ id: company.id, name: company.name });
          await newCompany.save();
          return newCompany._id;
        }
      }),
    );

    const casting = await this.newNames(movieData.casting);

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
      companies,
      genres,
      casting,
    });

    await createdMovie.save();

    return createdMovie.get('_id').toString();
  }

  async getOneMovie(movieId: string): Promise<MovieDocument> {
    const movie = await this.movieModel
      .findById(movieId)
      .populate([
        { path: 'companies', select: '-__v' },
        { path: 'genres', select: '-__v' },
        { path: 'casting.name', select: '-__v' },
      ])
      .select('-normalizedOriginalTitle -normalizedFrenchTitle -normalizedEnglishTitle -__v')
      .exec();

    if (!movie) throw new NotFoundException(`Movie "${movieId}" not found`);

    return movie;
  }

  async getRandomMovie(filter: string | string[]): Promise<string> {
    const filters = filter ? this.prepareFilters(filter) : {};
    const count = await this.movieModel.countDocuments(filters).exec();
    const random = Math.floor(Math.random() * count);

    const movie = await this.movieModel.findOne(filters).skip(random).select('_id').exec();

    return movie._id.toString();
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
    format?: 'full' | 'lite';
  }): Promise<OutputDto> {
    const { start, limit, sortby, direction, filter = [], format } = queries;
    const filters = this.prepareFilters(filter);

    const select =
      format === 'full'
        ? '-normalizedOriginalTitle -normalizedFrenchTitle -normalizedEnglishTitle -__v'
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
              { path: 'companies', select: '-__v' },
              { path: 'genres', select: '-__v' },
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

  async getMovieFromImdbApi(imdbId: string): Promise<MovieDto> {
    const isMovieExists = await this.movieModel
      .findOne({
        imdbId,
      })
      .exec();

    if (isMovieExists) {
      throw new ConflictException(
        `Movie with imdbId ${imdbId} already exists (${isMovieExists.get('_id').toString()}).`,
      );
    }

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
      casting: result.data.cast.map((castMember) => ({
        name: {
          id: castMember.id,
          text: castMember.fullName,
          picture: castMember.primaryImage,
        },
        characters: castMember.characters,
        job: castMember.job,
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

    let picture = movie.picture;
    if (updateMovieDto.picture && updateMovieDto.picture !== movie.picture) {
      const date = Date.now();
      picture = await this.picturesService.savePicture(
        { url: updateMovieDto.picture, name: `${movie.imdbId}_${date}`, size: { h: 800 } },
        PictureType.POSTER,
      );
      await this.picturesService.savePicture(
        { url: updateMovieDto.picture, name: `${movie.imdbId}_${date}`, size: { h: 400 } },
        PictureType.POSTER,
        true,
      );
    }

    return await this.movieModel
      .findByIdAndUpdate(movieId, { ...updateMovieDto, picture }, { new: true })
      .select('-normalizedOriginalTitle -normalizedFrenchTitle -normalizedEnglishTitle -__v')
      .populate([
        { path: 'companies', select: '-__v' },
        { path: 'genres', select: '-__v' },
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
        console.log(movieData.imdbId + ': ' + movieData.originalTitle);
        const newMovie = await this.getMovieFromImdbApi(movieData.imdbId);
        const casting = [...(newMovie.casting || [])];
        movieData.casting.principal.forEach((cast) => {
          const existingCast = casting.find((c) => c.name.id === cast.name.id);
          if (!existingCast) {
            casting.push({ ...cast, job: 'actor' });
          }
        });
        movieData.casting.extended.forEach((cast) => {
          const existingCast = casting.find((c) => c.name.id === cast.name.id);
          if (!existingCast) {
            casting.push({ ...cast, job: 'actor' });
          }
        });
        await this.createMovie({
          ...newMovie,
          originalTitle: newMovie.originalTitle || movieData.originalTitle,
          frenchTitle: movieData.frenchTitle,
          englishTitle: newMovie.englishTitle || movieData.englishTitle,
          picture: newMovie.picture || movieData.picture,
          releaseDate: newMovie.releaseDate || movieData.releaseDate,
          duration: newMovie.duration || movieData.duration,
          plot: newMovie.plot || movieData.plot,
          supports: movieData.supports,
          collections: movieData.collections,
          casting,
        });
      } catch (error) {
        console.error(`Error importing movie with imdbId ${movieData.imdbId}:`, error.message);
      }
    }
    console.log('=== Import completed ===');
  }
}
