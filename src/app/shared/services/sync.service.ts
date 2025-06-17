import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, take, tap } from 'rxjs';
import { FdroidRepositoryService } from './repository/fdroid-repository.service';
import { PopularRepositoryService } from './repository/popular-repository.service';
import { NotificationService } from './notification.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { LoggerService } from './logger.service';
import { PopupInstance, PopupService } from '../components/popup/popup.service';
import { ErrorComponent, ErrorPopupData } from '../popups/error/error.component';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  /**
   * The available sync intervals.
   */
  static readonly DEFAULT_SYNC_INTERVAL = 'Weekly';

  /**
   * The available sync intervals.
   */
  static readonly SYNC_INTERVALS = ['Daily', 'Weekly', 'Monthly', 'Never'];

  /**
   * Observable subject that allows watchers to be notified of changes to the sync state.
   * @private
   */
  private syncing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * BehaviorSubject for the date of the last database sync.
   * @private
   */
  private lastSyncDate$: BehaviorSubject<Date | undefined> = new BehaviorSubject<Date | undefined>(undefined);

  /**
   * BehaviorSubject for the interval to check for new database updates.
   * @private
   */
  private syncInterval$: BehaviorSubject<string> = new BehaviorSubject<string>(
    SyncService.DEFAULT_SYNC_INTERVAL);

  private popupReference: PopupInstance<ErrorPopupData> | undefined;

  /**
   * Constructor.
   * @param fdroidRepositoryService
   * @param popularRepositoryService
   * @param notificationService
   * @param popupService
   * @param loggerService
   * @param storageService
   */
  constructor(
    private fdroidRepositoryService: FdroidRepositoryService,
    private popularRepositoryService: PopularRepositoryService,
    private notificationService: NotificationService,
    private popupService: PopupService,
    private loggerService: LoggerService,
    @Inject(LOCAL_STORAGE) private storageService: StorageService,
  ) {
    this.lastSyncDate$.next(this.storageService.get('swc-last-sync-date'));
    this.syncInterval$.next(this.storageService.get('swc-sync-interval')
      ?? SyncService.DEFAULT_SYNC_INTERVAL);

    // Check if we need to check for new database updates
    this.checkSyncInterval();
  }

  /**
   * Sync all the services.
   */
  sync(): Observable<any> {
    this.syncing$.next(true);

    return this.popularRepositoryService.sync()
      .pipe(
        switchMap(() =>
          this.fdroidRepositoryService.sync()),
        tap(() =>
          this.setLastSyncDate(new Date())),
        tap(() =>
          this.syncing$.next(false)),
        tap(() =>
          this.popupReference?.close()),
        tap(() =>
          this.notificationService.create({
            title: 'Database Updates',
            body: `Saorsail database has been updated to the latest available from F-Droid.`,
        }))
      );
  }

  /**
   * Get the data of the last database sync.
   */
  lastSyncDate(): Observable<Date | undefined> {
    return this.lastSyncDate$.asObservable();
  }

  /**
   * Set the last sync date.
   * @param date
   */
  setLastSyncDate(
    date: Date
  ) {
    this.storageService.set('swc-last-sync-date', new Date().toISOString());
    this.lastSyncDate$.next(date);
  }

  /**
   * Observe changes to the sync interval.
   */
  observeSyncInterval(): Observable<string> {
    return this.syncInterval$.asObservable();
  }

  /**
   * Set the sync interval.
   * @param interval
   */
  setSyncInterval(
    interval: string
  ) {
    this.storageService.set('swc-sync-interval', interval);
    this.syncInterval$.next(interval);
  }

  /**
   * Observe if the repository is syncing or not.
   */
  syncing(): Observable<boolean> {
    return this.syncing$.asObservable();
  }

  /**
   * Show the sync warning popup.
   */
  showSyncWarning() {
    // Close any lingering popup
    this.popupReference?.close();

    // Show the popup
    this.popupReference = this.popupService.show(
      ErrorComponent, <ErrorPopupData> {
        title: 'Syncing...',
        message: 'The database is currently downloading, please wait before moving around the marketplace.',
        icon: 'general/sync'
      });
  }

  /**
   * This function will check if we need to look for new database updates. It uses the value from lastSyncDate$ to
   * check if our database is out of date. If it is, we will update.
   * @private
   */
  private checkSyncInterval(): any {
    this.loggerService.info('Checking Sync Interval');

    const lastSyncDateTime = this.lastSyncDate$.value;

    if (lastSyncDateTime == undefined) {
      return;
    }

    const syncInterval = this.syncInterval$.value.toLowerCase();
    const lastSyncTimeDelta = Math.abs(new Date().getTime() - new Date(lastSyncDateTime).getTime());

    if (syncInterval == 'daily' && lastSyncTimeDelta > 86400000
      || syncInterval == 'weekly' && lastSyncTimeDelta > 604800000
      || syncInterval == 'monthly' && lastSyncTimeDelta > 2629800000) {
      return this.sync()
        .pipe(take(1))
        .subscribe();
    }
  }
}