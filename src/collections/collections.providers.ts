import { Mongoose } from 'mongoose';
import { CollectionSchema } from './schemas/collection.schema';

export const CollectionsProviders = [
  {
    provide: 'COLLECTION_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Collection', CollectionSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
