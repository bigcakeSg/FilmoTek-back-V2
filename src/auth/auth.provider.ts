import { AuthGuard } from './auth.guard';

export const AuthProviders = [
  {
    provide: 'APP_GUARD',
    useClass: AuthGuard,
  },
];
