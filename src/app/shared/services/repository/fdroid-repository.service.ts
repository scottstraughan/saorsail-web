import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, forkJoin, Observable, switchMap, tap } from 'rxjs';
import { PopularRepositoryService } from './popular-repository.service';
import { Application, ImageReference, Repository } from '../../models/repository.model';
import { environment } from '../../../../environments/environment';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';
import slugify from 'slugify';

@Injectable({
  providedIn: 'root'
})
export class FdroidRepositoryService {
  /**
   * Database table name for categories.
   */
  static readonly CATEGORIES_DB_NAME = 'categories';

  /**
   * Database table name for applications.
   */
  static readonly APPLICATION_DB_NAME = 'applications';

  /**
   * The base URL where the repository lives.
   */
  static readonly REPOSITORY_BASE_URL = environment.fdroidDatabaseBaseUrl;

  /**
   * The URL where the generated repository lives.
   */
  static readonly REPOSITORY_DOWNLOAD_URL = environment.fdroidRepositoryUrl;

  /**
   * Constructor for the RepositorySync service.
   * @param httpClient
   * @param databaseService
   * @param popularService
   * @param loggerService
   */
  constructor(
    private httpClient: HttpClient,
    private databaseService: DatabaseService,
    private popularService: PopularRepositoryService,
    private loggerService: LoggerService,
  ) { }

  /**
   * Reload the repository, download it and save it.
   */
  sync(): Observable<any> {
    return this.httpClient.get<Repository>(FdroidRepositoryService.REPOSITORY_DOWNLOAD_URL)
      .pipe(
        switchMap((repository) =>
          this.save(repository)),
      )
  }

  /**
   * Resolve an image URL.
   * @param imageReference
   * @param fallback
   */
  resolveImageUrl(
    imageReference: ImageReference | undefined,
    fallback: string = '/assets/img/missing.webp'
  ): string {
    if (!imageReference) {
      return fallback;
    }

    return imageReference ? `${FdroidRepositoryService.REPOSITORY_BASE_URL}${imageReference.name}` : fallback;
  }

  /**
   * Save the repository response to the IndexDB.
   * @param repository
   * @private
   */
  private save(
    repository: Repository
  ): Observable<any> {
    return this.clear()
      .pipe(
        tap(() =>
          this.loggerService.info('Saving databases...')),
        switchMap(() =>
          forkJoin([
            this.saveApplications(repository),
            this.saveCategories(repository),
          ])
        ),
        tap(() =>
          this.loggerService.info('Successfully saved databases.'))
      )
  }

  /**
   * Clear all the databases.
   * @private
   */
  private clear(): Observable<any> {
    return forkJoin([
      this.databaseService.clear(FdroidRepositoryService.APPLICATION_DB_NAME),
      this.databaseService.clear(FdroidRepositoryService.CATEGORIES_DB_NAME)
    ])
  }

  /**
   * Save the categories to the store.
   * @param repository
   * @private
   */
  private saveCategories(
    repository: Repository
  ): Observable<any> {
    const categories: any[] = [];

    for (const [key, category] of Object.entries(repository.repo.categories)) {
      category.id = FdroidRepositoryService.createCategoryId(key);
      categories.push(category);
    }

    return this.databaseService.bulkAdd(FdroidRepositoryService.CATEGORIES_DB_NAME, categories);
  }

  /**
   * Save the applications to the store.
   * @param repository
   * @private
   */
  private saveApplications(
    repository: Repository
  ): Observable<any> {
    const packages: Application[] = [];

    for (const [packageNamespace, application] of Object.entries(repository.packages)) {
      application.namespace = packageNamespace;
      application.stars = 0;

      application.metadata.categories = application.metadata.categories.map(categoryName =>
        FdroidRepositoryService.createCategoryId(categoryName));

      packages.push(application);
    }

    const obs = packages.map(application =>
      this.popularService.injectApplicationStars(application)
        .pipe(first())
    )

    return forkJoin(obs)
      .pipe(
        switchMap(() =>
          this.databaseService.bulkAdd(FdroidRepositoryService.APPLICATION_DB_NAME, packages))
      );
  }

  /**
   * Generate a category id.
   * @param categoryName
   */
  static createCategoryId(
    categoryName: string
  ): string {
    return slugify(categoryName.toLowerCase());
  }
}
