import { Mongoose } from 'mongoose';
import { PictureSchema } from './schemas/picture.schema';

export const PicturesProviders = [
  {
    provide: 'PICTURE_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Picture', PictureSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
