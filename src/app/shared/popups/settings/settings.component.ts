import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  signal,
  Type,
  WritableSignal
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { PairedDevicesSettingsComponent } from './settings-panes/paired-devices/paired-devices-settings.component';
import { DisplaySettingsComponent } from './settings-panes/display/display-settings.component';
import { LocalizationSettingsComponent } from './settings-panes/localization/localization-settings.component';
import { StorageSettingsComponent } from './settings-panes/storage/storage-settings.component';
import { NotificationsSettingsComponent } from './settings-panes/notifications/notifications-settings.component';
import { MaskableIconComponent } from '../../components/maskable-icon/maskable-icon.component';
import { PopupInstance } from '../../components/popup/popup.service';
import { AboutSettingsComponent } from './settings-panes/about/about-settings.component';
import { SettingsHeaderComponent } from './components/setting-header/settings-header.component';
import { SettingsContentComponent } from './components/setting-content/settings-content.component';

@Component({
  imports: [
    MaskableIconComponent,
    NgComponentOutlet,
    SettingsHeaderComponent,
    SettingsContentComponent,
  ],
  selector: 'swc-settings',
  standalone: true,
  styleUrl: './settings.component.scss',
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  readonly panels: WritableSignal<SettingPanel[]> = signal([
    {
      id: SettingPanelId.DISPLAY,
      name: DisplaySettingsComponent.title,
      icon: DisplaySettingsComponent.icon,
      component: DisplaySettingsComponent
    },
    {
      id: SettingPanelId.PAIRED_DEVICES,
      name: PairedDevicesSettingsComponent.title,
      icon: PairedDevicesSettingsComponent.icon,
      component: PairedDevicesSettingsComponent
    },
    {
      id: SettingPanelId.LOCALIZATION,
      name: LocalizationSettingsComponent.title,
      icon: LocalizationSettingsComponent.icon,
      component: LocalizationSettingsComponent
    },
    {
      id: SettingPanelId.STORAGE,
      name: StorageSettingsComponent.title,
      icon: StorageSettingsComponent.icon,
      component: StorageSettingsComponent
    },
    {
      id: SettingPanelId.NOTIFICATIONS,
      name: NotificationsSettingsComponent.title,
      icon: NotificationsSettingsComponent.icon,
      component: NotificationsSettingsComponent
    },
    {
      id: SettingPanelId.ABOUT,
      name: AboutSettingsComponent.title,
      icon: AboutSettingsComponent.icon,
      component: AboutSettingsComponent
    },
  ]);

  readonly selectedPanel: WritableSignal<SettingPanel> = signal(this.panels()[0])

  /**
   * Constructor.
   */
  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<SettingsComponent>,
  ) {
    if (this.popupInstance.getPopupData()) {
      this.onSelectSettingsByName(this.popupInstance.getPopupData())
    }
  }

  /**
   * Set the selected settings panel by name.
   * @param id
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
   * @param panel
   */
  onSelectSettings(
    panel: SettingPanel
  ) {
    this.selectedPanel.set(panel);
  }
}

/**
 * Interface for a setting panel.
 */
interface SettingPanel {
  id: SettingPanelId
  name: string
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