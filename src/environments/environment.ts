import { LogLevel } from '../app/shared/services/logger.service';

export const environment = {
  logLevel: LogLevel.debug,
  fdroidDatabaseBaseUrl: 'https://f-droid.org/repo',
  fdroidRepositoryUrl: 'https://database.saorsail.com/v1/repository.json',
  popularDatabaseUrl: 'https://database.saorsail.com/v1/popular.json',
  installServiceEndpoint: 'https://saorsail-main-bf294c4.zuplo.app',
  bobEndpoint: 'http://localhost:3001',
};
