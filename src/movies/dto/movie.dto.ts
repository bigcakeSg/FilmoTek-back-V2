export interface Name {
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
    name: Name;
    attributes?: string[];
  }[];
  writers?: {
    name: Name;
    attributes?: string[];
  }[];
  casting: {
    principal: {
      name: Name;
      characters: string[];
      attributes?: string[];
    }[];
    extended: {
      name: Name;
      characters: string[];
      attributes?: string[];
    }[];
  };
  seen?: boolean;
}
