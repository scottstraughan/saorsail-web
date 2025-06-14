import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Application, ApplicationVersion, Category } from '../models/repository.model';
import { DatabaseService } from './database.service';
import { Filters, OrderBy, OrderDirection } from '../models/filters.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  static readonly DEFAULT_ORDER_BY = OrderBy.NAME;
  static readonly DEFAULT_ORDER_DIRECTION = OrderDirection.ASC;

  constructor(
    private databaseService: DatabaseService,
  ) { }

  getApplication(
    namespace: string
  ): Observable<Application> {
    return this.databaseService.getByID<Application>('applications', namespace);
  }

  all(): Observable<Application[]> {
    return this.databaseService.getAll<Application>('applications');
  }

  getLatest(
    limit: number = 20,
    offset: number = 0
  ): Observable<PartialResult<Application>> {
    let totalResultsCount = 0;

    return this.databaseService.getAll<Application>('applications')
      .pipe(
        tap(applications =>
          totalResultsCount = applications.length),
        map(applications => applications.sort((a: Application, b: Application) =>
          a.metadata.added < b.metadata.added ? 1 : -1)),
        map(applications =>
          applications.slice(offset, limit + offset)),
        map(applications => <PartialResult<Application>> {
          totalResultsCount: totalResultsCount,
          currentResultsCount: applications.length,
          results: applications
        })
      )
  }

  getPopular(
    limit: number = 20,
    offset: number = 0
  ): Observable<PartialResult<Application>> {
    let totalResultsCount = 0;

    return this.all()
      .pipe(
        tap(applications =>
          totalResultsCount = applications.length),
        map(applications => applications.sort((a: Application, b: Application) => {
          const aStars = a.stars ? a.stars : 0
          const bStars = b.stars ? b.stars : 0;
          return bStars - aStars;
        })),
        map(applications =>
          applications.slice(offset, limit + offset)),
        map(applications => <PartialResult<Application>> {
          totalResultsCount: totalResultsCount,
          currentResultsCount: applications.length,
          results: applications
        })
      )
  }

  searchApplications(
    searchValue: any,
    limit: number = 20,
    offset: number = 0
  ) {
    const searchWords = searchValue.toString().toLowerCase().split(' ');
    let totalResultsCount = 0;

    return this.databaseService.getAll<Application>('applications')
      .pipe(
        tap(applications =>
          totalResultsCount = applications.length),
        map(applications => {
          return applications.filter(application => {
            let searchableValues = JSON.stringify(Object.values(application.metadata.name));

            if (application.metadata.authorName) {
              searchableValues += ' ' + application.metadata.authorName;
            }

            searchableValues = searchableValues.toLowerCase();

            return searchWords.every((searchWord: string) =>
              searchableValues.toLowerCase().includes(searchWord));
          })
        }),
        map(applications =>
          applications.slice(offset, limit + offset)),
        map(applications => <PartialResult<Application>> {
          totalResultsCount: totalResultsCount,
          currentResultsCount: applications.length,
          results: applications
        })
      )
  }

  getApplicationsByCategory(
    filters: Filters
  ): Observable<PartialResult<Application>> {
    let totalResultsCount = 0;

    return this.databaseService.getAll<Application>('applications')
      .pipe(
        map(applications =>
          applications.filter(aPackage => aPackage.metadata.categories.includes(filters.category.id))),
        map(applications =>
          this.sortApplications(filters, applications)),
        tap(applications =>
          totalResultsCount = applications.length),
        map(applications =>
          applications.slice(filters.offset, filters.limit + filters.offset)),
        map(applications => <PartialResult<Application>> {
          totalResultsCount: totalResultsCount,
          currentResultsCount: applications.length,
          results: applications
        })
      )
  }

  private sortApplications(
    filters: Filters,
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

  getCategories(): Observable<Category[]> {
    return this.databaseService.getAll<Category>('categories')
      .pipe(
        map(categories => categories.sort(function(a: Category, b: Category) {
          return a.id > b.id ? 1 : -1
        }))
      );
  }

  getCategoriesThumbnail(
    categoryName: string
  ): string {
    categoryName = categoryName.toLowerCase();
    let icon = 'category_connectivity';

    switch (categoryName) {
      case 'connectivity':
        icon = 'category_connectivity';
        break;
      case 'development':
        icon = 'category_development';
        break;
      case 'games':
        icon = 'category_games';
        break;
      case 'graphics':
        icon = 'category_graphics';
        break;
      case 'internet':
        icon = 'category_internet';
        break;
      case 'money':
        icon = 'category_money';
        break;
      case 'navigation':
        icon = 'category_navigation';
        break;
      case 'reading':
        icon = 'category_reading';
        break;
      case 'science-and-education':
        icon = 'category_science_education';
        break;
      case 'security':
        icon = 'category_security';
        break;
      case 'system':
        icon = 'category_system';
        break;
      case 'theming':
        icon = 'category_theming';
        break;
      case 'writing':
        icon = 'category_writing';
        break;
    }

    return `/assets/img/categories/${icon}.png`;
  }

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
}

export interface PartialResult<T> {
  totalResultsCount: number
  currentResultsCount: number
  results: T[]
}

export class VersionNotFoundError extends Error {}