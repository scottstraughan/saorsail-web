import { LogLevel } from '../app/shared/services/logger.service';

export const environment = {
  logLevel: LogLevel.debug,
  fdroidDatabaseBaseUrl: 'https://f-droid.org/repo',
  fdroidRepositoryUrl: 'http://localhost:4200/assets/test-data/index-v2.json',
  popularDatabaseUrl: 'http://localhost:4200/assets/test-data/popular.json',
  installServiceEndpoint: 'https://saorsail-main-6e1e5bc.d2.zuplo.dev',
};
