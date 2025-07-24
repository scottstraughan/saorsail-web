import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, tap } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Application } from '../models/repository.model';
import { ApplicationService } from './application.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private static readonly STORAGE_KEY = 'swc-favorites';

  private favorites: Application[] = [];
  private favorites$: BehaviorSubject<Application[]> = new BehaviorSubject<Application[]>([]);

  /**
   * Constructor.
   */
  constructor(
    @Inject(LOCAL_STORAGE) private storageService: StorageService,
    private applicationService: ApplicationService,
  ) {
    this.loadFromStorage();
  }

  /**
   * Determine if an application is a favorite or not.
   * @param application
   */
  isFavorite(
    application: Application
  ) {
    const found = this.favorites.filter(favorite =>
      favorite.namespace == application.namespace);

    return found.length > 0;
  }

  /**
   * Toggle a favorite.
   * @param application
   */
  toggleFavorite(
    application: Application
  ) {
    if (this.isFavorite(application)) {
      return this.removeFavorite(application);
    }

    this.addFavorite(application);
  }


  /**
   * Observe changes to favorites.
   */
  observeFavorites(): Observable<Application[]> {
    return this.favorites$.asObservable();
  }

  /**
   * Load from storage the favorites.
   */
  private loadFromStorage() {
    let namespaces: string[] = this.storageService.get(FavoriteService.STORAGE_KEY);

    if (namespaces == undefined) {
      return this.notifyObservers();
    }

    const apps = namespaces.map(namespace =>
      this.applicationService.getApplication(namespace));

    forkJoin(apps)
      .pipe(
        map(apps => apps.filter(app => app !== undefined)),
        tap(apps => this.favorites = this.favorites.concat(apps)),
        tap(() => this.notifyObservers()),
      )
      .subscribe()
  }

  /**
   * Add a new favorite.
   * @private
   */
  private addFavorite(
    application: Application
  ) {
    this.favorites.push(application);
    this.storageService.set(FavoriteService.STORAGE_KEY, this.favorites.map(app => app.namespace));
    this.notifyObservers();
  }

  /**
   * Remove a favorite.
   * @private
   */
  private removeFavorite(
    application: Application
  ) {
    this.favorites = this.favorites.filter(favorite =>
      favorite.namespace !== application.namespace);

    this.storageService.set(FavoriteService.STORAGE_KEY, this.favorites.map(app => app.namespace));
    this.notifyObservers();
  }

  /**
   * Notify any observers of new changes.
   * @private
   */
  private notifyObservers() {
    this.favorites$.next(this.favorites);
  }
}