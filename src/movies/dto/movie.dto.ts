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
  companies: { id: string; name: string }[];
  genres: {
    id: string;
    text: string;
  }[];
  casting: {
    name: NameDto;
    characters: string[];
    job: string;
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
