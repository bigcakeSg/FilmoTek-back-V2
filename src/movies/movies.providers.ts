import { Mongoose } from 'mongoose';
import { MovieSchema } from './schemas/movie.schema';

export const MoviesProviders = [
  {
    provide: 'MOVIE_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Movie', MovieSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
