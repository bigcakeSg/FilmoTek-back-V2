import { MovieDocument } from '../schemas/movie.schema';

export interface NameDto {
  id: string;
  text: string;
  picture?: string;
}

export interface MovieDto {
  imdbId: string;
  originalTitle: string;
  frenchTitle?: string;
  englishTitle?: string;
  picture: string;
  releaseDate: string;
  duration: number;
  plot: string;
  genres: {
    id: string;
    text: string;
  }[];
  directors?: {
    name: NameDto;
    attributes?: string[];
  }[];
  writers?: {
    name: NameDto;
    attributes?: string[];
  }[];
  casting: {
    principal: {
      name: NameDto;
      characters: string[];
      attributes?: string[];
    }[];
    extended: {
      name: NameDto;
      characters: string[];
      attributes?: string[];
    }[];
  };
  supports?: string[];
  watched?: boolean;
}

export interface MovieOutputDto {
  _id: string;
  imdbId: string;
  originalTitle: string;
  normalizedOriginalTitle: string;
  frenchTitle?: string;
  normalizedFrenchTitle?: string;
  englishTitle?: string;
  normalizedEnglishTitle?: string;
  picture: string;
  releaseDate: string;
  duration: number;
  genres: {
    id: string;
    text: string;
  }[];
  supports: string[];
  videos: string[];
}

export interface OutputDto {
  count: number;
  totalCount: number;
  start?: number;
  limit?: number;
  data: MovieOutputDto[] | MovieDocument[];
}
