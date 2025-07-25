export interface PictureInputDto {
  url: string;
  name?: string;
  size?: { w?: number; h?: number };
}

export interface PictureOutputDto {
  url: string;
  height?: number;
  width?: number;
}
