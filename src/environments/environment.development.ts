import { LogLevel } from '../app/shared/services/logger.service';

export const environment = {
  logLevel: LogLevel.debug,
  fdroidDatabaseBaseUrl: 'https://f-droid.org/repo',
  fdroidRepositoryUrl: 'http://localhost:4200/assets/test/index-v2.json',
  popularDatabaseUrl: 'http://localhost:4200/assets/test/popular.json',
  installServiceEndpoint: 'https://saorsail-main-6e1e5bc.d2.zuplo.dev',
};
