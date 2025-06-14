import { ChangeDetectionStrategy, Component, computed, Inject, Signal } from '@angular/core';
import { ApplicationDevicePermission, ApplicationVersion } from '../../../shared/models/repository.model';
import { PopupInstance } from '../../../shared/components/popup/popup.service';

@Component({
  selector: 'swc-permissions',
  standalone: true,
  imports: [
  ],
  templateUrl: './permissions.component.html',
  styleUrls: [
    './../../../shared/components/popup/styles/small-simple.scss',
    './permissions.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsComponent {
  readonly version: Signal<ApplicationVersion>;

  constructor(
    @Inject('FDM_POPUP') popupInstance: PopupInstance<PermissionsComponent>,
  ) {
    this.version = computed(() => popupInstance.getPopupData());
  }

  getPermissionSdkUrl(
    permission: ApplicationDevicePermission
  ) {
    if (permission.name.startsWith('android.permission')) {
      const androidPermission = permission.name.replace('android.permission.', '');
      return `https://developer.android.com/reference/android/Manifest.permission#${androidPermission}`;
    }

    return undefined;
  }
}
