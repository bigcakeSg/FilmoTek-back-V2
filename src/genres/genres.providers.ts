import { Mongoose } from 'mongoose';
import { GenreSchema } from './schemas/genre.schema';

export const GenresProviders = [
  {
    provide: 'GENRE_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Genre', GenreSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
