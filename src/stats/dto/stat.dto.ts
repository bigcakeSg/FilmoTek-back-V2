type Support = 'vhs' | 'ld' | 'dvd' | 'bd' | 'uhd';

export type GenreStats = {
  [key in Support]: number;
};

export type DateStats = {
  [key: number]: GenreStats;
};

export type SupportStats = {
  [key: string]: number;
};
