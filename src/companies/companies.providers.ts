import { Mongoose } from 'mongoose';
import { CompanieSchema } from './schemas/companie.schema';

export const CompaniesProviders = [
  {
    provide: 'COMPANIE_MODEL',
    useFactory: (mongoose: Mongoose) => mongoose.model('Companie', CompanieSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
