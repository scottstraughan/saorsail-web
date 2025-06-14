import {
  ChangeDetectionStrategy, Component, Inject, OnInit, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { IconButtonComponent } from '../../../../../../components/icon-button/icon-button.component';
import { IconInputComponent } from '../../../../../../components/icon-input/icon-input.component';
import { PairedDevicesService } from '../../../../../../services/paired-devices.service';
import { PopupInstance } from '../../../../../../components/popup/popup.service';

@Component({
  selector: 'swc-pair-new-device',
  imports: [
    QRCodeComponent,
    IconButtonComponent,
    IconInputComponent,
  ],
  standalone: true,
  styleUrl: './pair-new-device.component.scss',
  templateUrl: './pair-new-device.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PairNewDeviceComponent implements OnInit {
  /**
   * The name of the device
   */
  readonly deviceName: WritableSignal<string> = signal('');

  /**
   * The device pairing code, show in the code div and also the QR code
   */
  readonly deviceCode: Signal<string> = signal(PairedDevicesService.generateCode());

  /**
   * Reference to the icon input, so we can focus it on view init
   * @protected
   */
  @ViewChild('nameInput')
  protected nameInput: IconInputComponent | undefined;

  /**
   * Constructor
   * @param popupInstance
   * @param pairedDevicesService
   */
  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<PairNewDeviceComponent>,
    private pairedDevicesService: PairedDevicesService
  ) { }

  /**
   * @interface
   */
  ngOnInit() {
    setTimeout(() => this.nameInput?.focusInput());
  }

  /**
   * Check if we have all the details to pair the new device.
   */
  isValid(): boolean {
    return this.deviceName().length > 0;
  }

  /**
   * Called when the user clicks the add device button.
   */
  onAddDevice() {
    if (!this.isValid()) {
      return ;
    }

    this.pairedDevicesService.add(this.deviceName(), this.deviceCode());
    this.popupInstance.close();
  }
}