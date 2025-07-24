import { Mongoose } from 'mongoose';
import { NameSchema } from './schemas/name.schema';

export const NamesProviders = [
  {
    provide: 'NAME_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Name', NameSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
