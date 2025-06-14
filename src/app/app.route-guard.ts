import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { SyncService } from './shared/services/sync.service';

@Injectable({ providedIn: 'root' })
export class AppRouteGuard implements CanDeactivate<any> {
  /**
   * Constructor.
   * @param syncService
   */
  constructor(
    private syncService: SyncService,
  ) { }

  /**
   * @inheritdoc
   */
  canDeactivate(
    component: any,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.syncService.syncing()
      .pipe(
        tap(syncing => {
          if (syncing) {
            this.syncService.showSyncWarning();
          }
        }),
        map(syncing =>
          !syncing)
      );
  }
}