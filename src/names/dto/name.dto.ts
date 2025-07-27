export class NameInputDto {
  id: string;
  text: string;
  picture?: {
    url: string;
    height?: number;
    width?: number;
  };
}
