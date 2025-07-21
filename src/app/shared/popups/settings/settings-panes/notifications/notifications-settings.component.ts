import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { SettingsBlockItemComponent } from '../../components/setting-block-item/settings-block-item.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { MaskableIconComponent } from '../../../../components/maskable-icon/maskable-icon.component';
import { NotificationService, UserNotificationState } from '../../../../services/notification.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [
    SettingsBlockItemComponent,
    IconButtonComponent,
    MaskableIconComponent,
    TranslatePipe,
  ],
  selector: 'swc-settings-notifications',
  standalone: true,
  styleUrl: './notifications-settings.component.scss',
  templateUrl: './notifications-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsSettingsComponent {
  static icon: string = 'general/notification';
  static title: string = `Notifications`;

  protected readonly notificationsState: Signal<UserNotificationState>;

  constructor(
    private notificationService: NotificationService
  ) {
    this.notificationsState = toSignal(
      this.notificationService.observePermission(), { initialValue: UserNotificationState.NOT_SPECIFIED });
  }

  /**
   * Get the title of this settings component.
   */
  get title() {
    return NotificationsSettingsComponent.title;
  }

  onAskPermission() {
    this.notificationService.askPermission()
      .then();
  }

  onSendTestNotification() {
    this.notificationService.create({
      title: 'Soarsail Says Hi',
      body: 'Just a quick test of the notification service!',
      icon: '/assets/img/logo-black.svg'
    })
  }

  protected readonly UserNotificationState = UserNotificationState;
}
