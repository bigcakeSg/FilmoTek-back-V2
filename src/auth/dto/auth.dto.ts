export interface SignInDto {
  username: string;
  password: string;
  isNoExpire?: boolean;
}

export interface SignUpDto {
  username: string;
  firstname: string;
  lastname: string;
  password: string;
}
