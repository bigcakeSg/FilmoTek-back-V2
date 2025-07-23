import { Mongoose } from 'mongoose';
import { SupportSchema } from './schemas/support.schema';

export const SupportsProviders = [
  {
    provide: 'SUPPORT_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('support', SupportSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
