import { ChangeDetectionStrategy, Component, Inject, OnDestroy, signal, Type, WritableSignal } from '@angular/core';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { PairedDevicesSettingsComponent } from './settings-panes/paired-devices/paired-devices-settings.component';
import { DisplaySettingsComponent } from './settings-panes/display/display-settings.component';
import { LocalizationSettingsComponent } from './settings-panes/localization/localization-settings.component';
import { StorageSettingsComponent } from './settings-panes/storage/storage-settings.component';
import { NotificationsSettingsComponent } from './settings-panes/notifications/notifications-settings.component';
import { AboutSettingsComponent } from './settings-panes/about/about-settings.component';
import { SettingsHeaderComponent } from './components/setting-header/settings-header.component';
import { SettingsContentComponent } from './components/setting-content/settings-content.component';
import { TranslateService, Translation } from '@ngx-translate/core';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { MaskableIconComponent } from '../shared/components/maskable-icon/maskable-icon.component';
import { PopupInstance } from '../shared/components/popup/popup.service';
import { LocalizationService } from '../shared/services/localization.service';

@Component({
  imports: [
    MaskableIconComponent,
    NgComponentOutlet,
    SettingsHeaderComponent,
    SettingsContentComponent,
    AsyncPipe,
  ],
  selector: 'swc-settings',
  standalone: true,
  styleUrl: './settings.component.scss',
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnDestroy {
  /**
   * Settings panels signal.
   */
  protected readonly panels: WritableSignal<SettingPanel[]> = signal([]);

  /**
   * The current selected settings panel.
   */
  protected readonly selectedPanel: WritableSignal<SettingPanel | undefined> = signal(undefined);

  /**
   * Observable to mark the component ready for deletion.
   * @private
   */
  private readonly onDestroy$: Subject<void> = new Subject();

  /**
   * Constructor.
   */
  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<SettingsComponent>,
    private translateService: TranslateService,
    protected localizationService: LocalizationService,
  ) {
    this.localizationService.observeLocal()
      .pipe(
        tap(() => this.reload()),
        takeUntil(this.onDestroy$)
      )
      .subscribe()
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  /**
   * Set the selected settings panel by name.
   */
  onSelectSettingsByName(
    id: SettingPanelId
  ) {
    for (const panel of this.panels()) {
      if (panel.id == id) {
        this.onSelectSettings(panel);
        return ;
      }
    }
  }

  /**
   * Set the selected settings panel.
   */
  onSelectSettings(
    panel: SettingPanel
  ) {
    this.selectedPanel.set(panel);
  }

  /**
   * Check if a panel is selected or not.
   */
  isPanelSelected(
    panel: SettingPanel
  ) {
    const selectedPanel = this.selectedPanel();

    if (selectedPanel == undefined) {
      return false;
    }

    return panel.id == selectedPanel.id;
  }

  /**
   * Reload the settings panels.
   */
  private reload() {
    this.panels.set(this.getComponents());
    this.selectedPanel.set(this.selectedPanel() ? this.selectedPanel() : this.panels()[0]);

    if (this.popupInstance.getPopupData()) {
      this.onSelectSettingsByName(this.popupInstance.getPopupData())
    }
  }

  /**
   * Get the supported settings panels.
   * @private
   */
  private getComponents(): SettingPanel[] {
    return [
      {
        id: SettingPanelId.DISPLAY,
        name: this.translateService.get('SETTINGS_DISPLAY_TITLE'),
        icon: DisplaySettingsComponent.icon,
        component: DisplaySettingsComponent
      },
      {
        id: SettingPanelId.PAIRED_DEVICES,
        name: this.translateService.get('SETTINGS_PAIRED_DEVICES_TITLE'),
        icon: PairedDevicesSettingsComponent.icon,
        component: PairedDevicesSettingsComponent
      },
      {
        id: SettingPanelId.LOCALIZATION,
        name: this.translateService.get('SETTINGS_LOCALIZATION_TITLE'),
        icon: LocalizationSettingsComponent.icon,
        component: LocalizationSettingsComponent
      },
      {
        id: SettingPanelId.STORAGE,
        name: this.translateService.get('SETTINGS_STORAGE_TITLE'),
        icon: StorageSettingsComponent.icon,
        component: StorageSettingsComponent
      },
      {
        id: SettingPanelId.NOTIFICATIONS,
        name: this.translateService.get('SETTINGS_NOTIFICATIONS_TITLE'),
        icon: NotificationsSettingsComponent.icon,
        component: NotificationsSettingsComponent
      },
      {
        id: SettingPanelId.ABOUT,
        name: this.translateService.get('SETTINGS_ABOUT_TITLE'),
        icon: AboutSettingsComponent.icon,
        component: AboutSettingsComponent
      },
    ];
  }
}

/**
 * Interface for a setting panel.
 */
interface SettingPanel {
  id: SettingPanelId
  name: Observable<Translation>
  icon: string
  component: Type<any>
}

/**
 * Enum that can be used throughout the app to reference/open a specific panel within the settings popup.
 */
export enum SettingPanelId {
  DISPLAY,
  PAIRED_DEVICES,
  LOCALIZATION,
  STORAGE,
  NOTIFICATIONS,
  ABOUT,
}