import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<UserDocument>) {}

  async findOneUsers(username: string): Promise<UserDocument> {
    return await this.userModel.findOne({ username }).select('-__v').exec();
  }
}
