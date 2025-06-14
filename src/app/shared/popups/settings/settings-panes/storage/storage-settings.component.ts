import { ChangeDetectionStrategy, Component, Inject, signal, Signal, WritableSignal } from '@angular/core';
import { SettingsBlockItemComponent } from '../../components/setting-block-item/settings-block-item.component';
import { take, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AsyncPipe, DatePipe } from '@angular/common';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingIndicatorComponent } from '../../../../components/loading-indicator/loading-indicator.component';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { DatabaseService } from '../../../../services/database.service';
import { SyncService } from '../../../../services/sync.service';
import { PairedDevicesSettingsComponent } from '../paired-devices/paired-devices-settings.component';

@Component({
  imports: [
    IconButtonComponent,
    SettingsBlockItemComponent,
    LoadingIndicatorComponent,
    AsyncPipe,
    DatePipe,
    FormsModule
  ],
  selector: 'swc-settings-storage',
  standalone: true,
  styleUrl: './storage-settings.component.scss',
  templateUrl: './storage-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorageSettingsComponent {
  static icon: string = 'thin/sync';
  static title: string = 'Storage / Sync';

  readonly loading: Signal<boolean>;
  readonly currentUpdateInterval: Signal<string>;
  readonly updateIntervals: WritableSignal<string[]> = signal(SyncService.SYNC_INTERVALS)

  constructor(
    protected syncService: SyncService,
    private databaseService: DatabaseService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private storageService: StorageService
  ) {
    this.loading = toSignal(
      this.syncService.syncing(), { initialValue: false });

    this.currentUpdateInterval = toSignal(
      this.syncService.observeSyncInterval(),
      { initialValue: SyncService.DEFAULT_SYNC_INTERVAL });
  }

  /**
   * Get the title of this settings component.
   */
  get title() {
    return PairedDevicesSettingsComponent.title;
  }

  /**
   * Called when a user wishes to force refresh the app database.
   */
  onReloadAppDatabase() {
    this.syncService.sync()
      .pipe(take(1))
      .subscribe();
  }

  /**
   * Called when a user wishes to reset the entire marketplace.
   */
  onReset() {
    this.storageService.clear();
    this.databaseService.clear()
      .pipe(
        tap(() =>
          window.location.href = '/welcome')
      )
      .subscribe();
  }

  /**
   * Called when the sync interval has changed.
   * @param $event
   */
  onSyncIntervalChanged(
    $event: any
  ) {
    this.syncService.setSyncInterval($event.target.value);
  }
}