export enum PictureType {
  PORTRAIT = 'portrait',
  POSTER = 'poster',
}
export interface PictureDto {
  url: string;
  name: string;
  size?: { w?: number; h?: number };
}
