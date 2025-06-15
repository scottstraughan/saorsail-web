import { LogLevel } from '../app/shared/services/logger.service';

export const environment = {
  logLevel: LogLevel.info,
  fdroidDatabaseBaseUrl: 'https://f-droid.org/repo',
  fdroidRepositoryUrl: 'https://f-droid.org/repo/index-v2.json',
  popularDatabaseUrl: 'https://popular-db.saorsail.com/db.json',
  installServiceEndpoint: 'https://saorsail-main-6e1e5bc.d2.zuplo.dev/install',
};
