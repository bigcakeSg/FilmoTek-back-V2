import * as bcrypt from 'bcrypt';
import { ConflictException, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private getPayload(user: UserDocument) {
    return {
      id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
    };
  }

  async signIn(
    username: string,
    password: string,
    isNoExpire?: boolean,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findOneUsers(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = this.getPayload(user);

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.createRefreshToken(user, isNoExpire),
    };
  }

  async signUp(username: string, password: string, firstname: string, lastname: string): Promise<void> {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.usersService.createUser({
        username,
        password: hashedPassword,
        firstname,
        lastname,
      });
    } catch (error) {
      //MongoDB unicity error.code === 11000
      if (error.code === 11000) {
        throw new ConflictException('User already exists');
      }
      throw new HttpException(error.message, 500);
    }
  }

  async createRefreshToken(user: UserDocument, isNoExpire?: boolean): Promise<string> {
    const refreshToken = await this.jwtService.signAsync({}, { expiresIn: isNoExpire ? undefined : '1d' });
    user.refreshToken = refreshToken;
    await user.save();
    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userModel.findOne({ refreshToken });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = this.getPayload(user);

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.error('Error verifying refresh token:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
