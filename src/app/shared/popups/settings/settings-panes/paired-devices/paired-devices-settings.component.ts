import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Signal, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { PairNewDeviceComponent } from './popups/pair-new-device/pair-new-device.component';
import { MaskableIconComponent } from '../../../../components/maskable-icon/maskable-icon.component';
import { IconButtonComponent } from '../../../../components/icon-button/icon-button.component';
import { PairedDevice, PairedDevicesService } from '../../../../services/paired-devices.service';
import { PopupService } from '../../../../components/popup/popup.service';
import { CopyInputComponent } from '../../../../components/copy-to-clipboard/copy-input.component';
import { ChangeEndpointComponent } from './popups/change-endpoint/change-endpoint.component';

@Component({
  imports: [
    IconButtonComponent,
    MaskableIconComponent,
    CopyInputComponent,
  ],
  selector: 'swc-settings-paired-devices',
  standalone: true,
  styleUrl: './paired-devices-settings.component.scss',
  templateUrl: './paired-devices-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PairedDevicesSettingsComponent {
  public static icon: string = 'thin/phone';
  public static title: string = 'Paired Devices';

  readonly pairedDevices: Signal<PairedDevice[]> = signal([]);

  /**
   * Constructor.
   */
  constructor(
    private pairedDevicesService: PairedDevicesService,
    private changeDetectorRef: ChangeDetectorRef,
    private popupService: PopupService,
  ) {
    this.pairedDevices = toSignal(this.pairedDevicesService.paired()
      .pipe(tap(() => this.changeDetectorRef.markForCheck())), // Not sure why this is needed.... but it is
      { initialValue: [] });
  }

  /**
   * Get the title of this settings component.
   */
  get title() {
    return PairedDevicesSettingsComponent.title;
  }

  /**
   * Remove a specific paired device.
   */
  onRemovePairedDevice(
    device: PairedDevice
  ) {
    this.pairedDevicesService.delete(device);
  }

  /**
   * Called when a user wants to add a new paired device.
   */
  onAddPairedDevice() {
    this.popupService.show(
      PairNewDeviceComponent, undefined);
  }

  /**
   * Called when a user wishes to change the endpoint.
   */
  onChangeEndpoint() {
    this.popupService.show(
      ChangeEndpointComponent, undefined);
  }
}
