import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { Application, ApplicationVersion, Category } from '../models/repository.model';
import { DatabaseService } from './database.service';
import { ModelFilters, ModelOrder, OrderBy, OrderDirection } from '../models/filters.model';
import { Filters, FilterValue, MultiFilterGroup } from '../lib/filters';
import { IndexedDBRequest } from '../lib/indexed-database';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  /**
   * Database service.
   * @private
   */
  private databaseService: DatabaseService = inject(DatabaseService);

  /**
   * Logger service.
   * @private
   */
  private loggerService: LoggerService = inject(LoggerService);

  /**
   * Get a specific application by its namespace.
   */
  getApplication(
    namespace: string
  ): Observable<Application> {
    return this.databaseService.getByID<Application>('applications', namespace);
  }

  /**
   * Get the latest apps.
   */
  getLatest(
    limit: number = 20,
    offset: number = 0
  ): Observable<PartialResult<Application>> {
    const filters: ModelFilters = new ModelFilters(
      <ModelOrder> { by: OrderBy.DATE_ADDED, direction: OrderDirection.DESC },
      limit,
      offset
    );

    return this.getApplications(filters);
  }

  /**
   * Get the most popular apps.
   */
  getPopular(
    limit: number = 20,
    offset: number = 0
  ): Observable<PartialResult<Application>> {
    const filters: ModelFilters = new ModelFilters(
      <ModelOrder> { by: OrderBy.POPULARITY, direction: OrderDirection.DESC },
      limit,
      offset
    );

    return this.getApplications(filters);
  }

  /**
   * Get an array of applications and filter them using the provided filters.
   * Note: this function uses a web worker for performance but will fall back to direct indexDB access on failure.
   */
  getApplications(
    filters: ModelFilters
  ): Observable<PartialResult<Application>> {
    if (typeof Worker !== 'undefined') {
      this.loggerService.info('Web worker supported, fetching applications via worker...');

      const promise = new Promise<PartialResult<Application>>((resolve, reject) => {
        const worker = new Worker(new URL('./../workers/indexed-db.worker', import.meta.url));

        // Receive response
        worker.onmessage = (event) => {
          resolve(event.data);
          worker.terminate();
        };

        // Handle errors
        worker.onerror = (err: any) => {
          worker.terminate();
          console.log(err);
          reject(err);
        };

        const workerData: IndexedDBRequest = new IndexedDBRequest(
          'swc-data', 'applications', filters);

        // Send request
        worker.postMessage(JSON.stringify(workerData));
      });

      // Verify we are in a valid state, return promise to worker if we are
      return from(this.databaseService.verifyValidState('applications'))
        .pipe(switchMap(() => from(promise)))
    }

    this.loggerService.warn('Web worker not supported, fetching applications directly...');

    return this.databaseService.getAll<Application>('applications')
      .pipe(
        map(applications =>
          ApplicationService.restrict(filters, applications))
      )
  }

  /**
   * Get all the supported categories.
   */
  getCategories(): Observable<Category[]> {
    return this.databaseService.getAll<Category>('categories')
      .pipe(
        map(categories => categories.sort(function(a: Category, b: Category) {
          return a.id > b.id ? 1 : -1
        }))
      );
  }

  /**
   * Get the latest version of an application.
   */
  getLatestVersion(
    application: Application
  ): ApplicationVersion {
    const versions = Object.values(application.versions);
    let latestVersion = versions[0];

    for (const version of versions) {
      if (version.added > latestVersion.added) {
        latestVersion = version;
      }
    }

    return latestVersion;
  }

  /**
   * Get a specific version of an application.
   */
  getVersion(
    application: Application,
    version: string
  ): ApplicationVersion {
    const versions = Object.values(application.versions);

    for (const currentVersion of versions) {
      if (currentVersion.manifest.versionName == version) {
        return currentVersion;
      }
    }

    throw new VersionNotFoundError('Could not find version.');
  }

  /**
   * Filter applications provided using filters provided and return the filtered applications.
   */
  static restrict(
    modelFilters: ModelFilters,
    applications: Application[]
  ): PartialResult<Application> {
    // Total app count
    const totalResultsCount = applications.length;

    if (modelFilters.filters) {
      // Filter out apps based on filters
      applications = ApplicationService.filterApplications(modelFilters.filters, applications);
    }

    // Sort the apps using filters
    applications = ApplicationService.sortApplications(modelFilters, applications);

    // Filtered count
    const filteredResultsCount = applications.length;

    // Slice apps based on filters
    applications = applications.slice(modelFilters.offset, modelFilters.limit + modelFilters.offset);

    return <PartialResult<Application>> {
      totalResultsCount: totalResultsCount,
      filteredResultsCount: filteredResultsCount,
      currentResultsCount: applications.length,
      results: applications
    }
  }

  /**
   * Filter applications based on filters.
   */
  private static filterApplications(
    filters: Filters | undefined,
    applications: Application[]
  ): Application[] {
    if (!filters)
      return applications;

    const found: Application[] = [];

    const categories = filters.getFilter<MultiFilterGroup<string>>('categories').allEnabled()
      .map(category => category.id);

    const keywordFilterStrings = filters.getFilter<FilterValue>('keywords').value.toLowerCase();
    const enabledStars = filters.getFilter<MultiFilterGroup<string>>('stars').allEnabled()
      .map(category => category.id);

    const enabledLicenses: string[] = filters.getFilter<MultiFilterGroup<string>>('license').allEnabled()
      .map(category => category.id.toLowerCase());

    for (const application of applications) {
      let passedFilters = true;

      // Ensure apps pass keyword filter checks
      if (keywordFilterStrings.length > 0
        && !JSON.stringify(application.metadata).toLowerCase().includes(keywordFilterStrings))
        continue

      // Ensure apps pass categories filter checks
      if (categories.length > 0
        && !categories.some(category => application.metadata.categories.includes(category)))
        continue

      // Ensure apps pass stars checks
      if (enabledStars.length > 0) {
        for (const stars of enabledStars) {
          if (application.stars == undefined || application.stars < Number.parseInt(stars))
            passedFilters = false;
        }
      }

      // Ensure apps pass license filter checks
      if (enabledLicenses.length > 0)  {
        if (!enabledLicenses.some(license => application.metadata.license.toLowerCase().includes(license)))
          passedFilters = false;
      }

      // App has passed all filter checks, add it to "the list"
      if (passedFilters)
        found.push(application);
    }

    return found;
  }

  /**
   * Sort provided applications based on filters.
   */
  private static sortApplications(
    filters: ModelFilters,
    applications: Application[]
  ): Application[] {
    if (filters.order.by == OrderBy.NAME && filters.order.direction == OrderDirection.ASC) {
      return applications.sort(function(a: Application, b: Application) {
        return a.metadata.name['en-US'] > b.metadata.name['en-US'] ? 1 : -1
      });
    } else if (filters.order.by == OrderBy.NAME && filters.order.direction == OrderDirection.DESC) {
      return applications.sort(function(a: Application, b: Application) {
        return a.metadata.name['en-US'] < b.metadata.name['en-US'] ? 1 : -1
      });
    } else if (filters.order.by == OrderBy.DATE_ADDED && filters.order.direction == OrderDirection.ASC) {
      return applications.sort(function(a: Application, b: Application) {
        return a.metadata.added > b.metadata.added ? 1 : -1
      });
    } else if (filters.order.by == OrderBy.DATE_ADDED && filters.order.direction == OrderDirection.DESC) {
      return applications.sort(function(a: Application, b: Application) {
        return a.metadata.added < b.metadata.added ? 1 : -1
      });
    } else if (filters.order.by == OrderBy.DATE_UPDATED && filters.order.direction == OrderDirection.ASC) {
      return applications.sort(function(a: Application, b: Application) {
        return a.metadata.lastUpdated > b.metadata.lastUpdated ? 1 : -1
      });
    } else if (filters.order.by == OrderBy.DATE_UPDATED && filters.order.direction == OrderDirection.DESC) {
      return applications.sort(function(a: Application, b: Application) {
        return a.metadata.lastUpdated < b.metadata.lastUpdated ? 1 : -1
      });
    } else if (filters.order.by == OrderBy.POPULARITY && filters.order.direction == OrderDirection.ASC) {
      return applications.sort(function(a: Application, b: Application) {
        const aStars = a.stars ?? 0;
        const bStars = b.stars ?? 0;
        return aStars > bStars ? 1 : -1
      });
    } else if (filters.order.by == OrderBy.POPULARITY && filters.order.direction == OrderDirection.DESC) {
      return applications.sort(function(a: Application, b: Application) {
        const aStars = a.stars ?? 0;
        const bStars = b.stars ?? 0;
        return aStars < bStars ? 1 : -1
      });
    }

    return applications;
  }
}

/**
 * A partial result. Since we can apply filters and limit apps per request, we want to provide information about the
 * full request and also the returned request.
 */
export interface PartialResult<T> {
  totalResultsCount: number
  filteredResultsCount: number
  currentResultsCount: number
  results: T[]
}

/**
 * Error when a version is not found.
 */
export class VersionNotFoundError extends Error {}
