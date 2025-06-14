import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Application } from '../../models/repository.model';
import { environment } from '../../../../environments/environment';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';

@Injectable({
  providedIn: 'root'
})
export class PopularRepositoryService {
  /**
   * Database storage key for popularity.
   */
  static readonly POPULARITY_DB_NAME = 'popularity';

  /**
   * Popular database URL.
   */
  static readonly URL = environment.popularDatabaseUrl;

  /**
   * Constructor.
   * @param httpClient
   * @param databaseService
   * @param loggerService
   */
  constructor(
    private httpClient: HttpClient,
    private databaseService: DatabaseService,
    private loggerService: LoggerService,
  ) { }

  /**
   * Inject stats into the provided application.
   * @param application
   */
  injectApplicationStars(
    application: Application
  ): Observable<Application> {
    return this.databaseService.getByID<PopularDatabaseItem>(
      PopularRepositoryService.POPULARITY_DB_NAME, application.namespace)
      .pipe(
        map(popularItem => {
          application.stars = popularItem.stars;
          return application;
        }),
        catchError(() =>
          of(application))
      );
  }

  /**
   * Sync the popular database.
   */
  sync(): Observable<any> {
    return this.databaseService.clear(PopularRepositoryService.POPULARITY_DB_NAME)
      .pipe(
        switchMap(() =>
          this.httpClient.get<PopularDatabaseItem[]>(PopularRepositoryService.URL)),
        tap(() =>
          this.loggerService.info('Successfully fetched popularity database.')),
        map(popularIndex => {
          const databaseItems: PopularDatabaseItem[] = [];

          for (const [namespace, entry] of Object.entries(popularIndex)) {
            databaseItems.push({
              namespace: namespace,
              stars: entry.stars
            });
          }

          return databaseItems;
        }),
        switchMap(databaseItems =>
          this.databaseService.bulkAdd(PopularRepositoryService.POPULARITY_DB_NAME, databaseItems)),
        tap(() =>
          this.loggerService.info('Successfully saved popularity database.'))
      );
  }
}

export interface PopularDatabaseItem {
  namespace: string
  stars: number
}