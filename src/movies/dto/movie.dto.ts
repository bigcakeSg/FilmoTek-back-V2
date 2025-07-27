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

export interface MoviesOutputDto {
  count: number;
  totalCount: number;
  start?: number;
  limit?: number;
  data: {
    _id: string;
    imdbId: string;
    originalTitle: string;
    regionalTitles?: [
      {
        title: string;
        region: string;
      },
    ];
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
  }[]; // FIXME:
}
/*
{
            "_id": "688653bbb7b2421d7d12e4c6",
            "imdbId": "tt0133092",
            "originalTitle": "The Matrix",
            "regionalTitles": [
                {
                    "title": "Matrix",
                    "region": "FR"
                }
            ],
            "picture": "POSTERs/TheMatrix-1753633722940.jpg",
            "releaseDate": "1999-06-17T00:00:00.000Z",
            "duration": 8160,
            "directors": [
                {
                    "name": [
                        {
                            "_id": "68864b83ff2f3864f945b827",
                            "id": "nm0905152",
                            "text": "Lilly Wachowski"
                        },
                        {
                            "_id": "68864b83ff2f3864f945b829",
                            "id": "nm0905154",
                            "text": "Lana Wachowski"
                        }
                    ],
                    "attributes": []
                },
                {
                    "name": [
                        {
                            "_id": "68864b83ff2f3864f945b827",
                            "id": "nm0905152",
                            "text": "Lilly Wachowski"
                        },
                        {
                            "_id": "68864b83ff2f3864f945b829",
                            "id": "nm0905154",
                            "text": "Lana Wachowski"
                        }
                    ],
                    "attributes": []
                }
            ],
            "watched": false
        
*/
