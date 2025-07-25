import { Mongoose } from 'mongoose';
import { UserSchema } from './schemas/user.schema';

export const NamesProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('User', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
