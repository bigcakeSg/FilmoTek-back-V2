import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { SignInDto, SignUpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(@Body() signInDto: SignUpDto) {
    return this.authService.signUp(signInDto.username, signInDto.password, signInDto.firstname, signInDto.lastname);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
