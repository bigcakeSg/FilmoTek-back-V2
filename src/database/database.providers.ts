import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> => {
      let dbUrl = `${process.env.MONGO_ROOT}${process.env.MONGODB_PSWD}`;
      switch (process.env.NODE_ENV) {
        case 'prod':
          dbUrl = dbUrl + process.env.MONGO_URI_PROD;
          break;
        case 'dev':
          dbUrl = dbUrl + process.env.MONGO_URI_DEV;
          break;
        case 'test':
        default:
          dbUrl = dbUrl + process.env.MONGO_URI_TEST;
      }
      return await mongoose.connect(dbUrl);
    },
  },
];
