export enum PictureType {
  PORTRAIT = 'portrait',
  POSTER = 'POSTER',
}
export interface PictureDto {
  url: string;
  name?: string;
  size?: { w?: number; h?: number };
}
