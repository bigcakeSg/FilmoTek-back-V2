import { Mongoose } from 'mongoose';
import { NameSchema } from './schemas/name.schema';

export const NamesProviders = [
  {
    provide: 'NAME_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('name', NameSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
