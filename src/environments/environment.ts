import { LogLevel } from '../app/shared/services/logger.service';

export const environment = {
  logLevel: LogLevel.info,
  fdroidDatabaseBaseUrl: 'https://f-droid.org/repo',
  fdroidRepositoryUrl: 'https://database.saorsail.com/v1/repository.json',
  popularDatabaseUrl: 'https://database.saorsail.com/v1/popular.json',
  installServiceEndpoint: 'https://saorsail-main-6e1e5bc.d2.zuplo.dev',
};
