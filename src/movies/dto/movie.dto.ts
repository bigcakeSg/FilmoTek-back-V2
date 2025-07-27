export interface NameDto {
  id: string;
  text: string;
  picture?: string;
}

export interface MovieDto {
  imdbId: string;
  originalTitle: string;
  regionalTitles?: [
    {
      title: string;
      region: string;
    },
  ];
  picture: string;
  releaseDate: {
    year: number;
    month: number;
    day: number;
  };
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
  watched?: boolean;
}

export interface MovieOutputDto {
  _id: string;
  imdbId: string;
  originalTitle: string;
  frenchTitle?: string;
  picture: string;
  releaseDate: string;
  duration: number;
  genres: {
    id: string;
    text: string;
  }[];
  directors?: {
    name: NameDto;
    attributes?: string[];
  }[];
  watched?: boolean;
}

export interface OutputDto {
  count: number;
  totalCount: number;
  start?: number;
  limit?: number;
  data: MovieOutputDto[];
}

export interface filterDto {
  filter: string;
  value: string;
}
