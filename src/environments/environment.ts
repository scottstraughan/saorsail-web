import { LogLevel } from '../app/shared/services/logger.service';

export const environment = {
  logLevel: LogLevel.debug,
  fdroidDatabaseBaseUrl: 'https://f-droid.org/repo',
  fdroidRepositoryUrl: '/assets/test-data/index-v2.json',
  popularDatabaseUrl: '/assets/test-data/popular.json',
  installServiceEndpoint: 'https://saorsail-main-1ca2e7d.d2.zuplo.dev',
};
