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
    name: { id: string; text: string; picture: string };
    attributes?: string[];
  }[];
  writers?: {
    name: { id: string; text: string; picture: string };
    attributes?: string[];
  }[];
  casting: {
    principal: {
      name: { id: string; text: string; picture: string };
      characters: string[];
      attributes?: string[];
    }[];
    extended: {
      name: { id: string; text: string; picture: string };
      characters: string[];
      attributes?: string[];
    }[];
  };
  watched?: boolean;
}
