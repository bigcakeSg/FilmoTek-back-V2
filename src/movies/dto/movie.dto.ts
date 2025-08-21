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
  countriesOfOrigin: string[];
  spokenLanguages: string[];
  companies: { id: string; text: string }[];
  genres: {
    id: string;
    text: string;
  }[];
  directors: {
    name: NameDto;
  }[];
  writers: {
    name: NameDto;
  }[];
  casting: {
    name: NameDto;
    characters: string[];
  }[];
  supports: string[];
  videos: string[];
  collections: string[];
}
export interface MovieOutputDto extends MovieDto {
  _id: string;
}
export interface OutputDto {
  totalCount: number;
  filterCount: number;
  countToEnd: number;
  start: number;
  limit?: number;
  data: MovieOutputDto[] | MovieDocument[];
}
