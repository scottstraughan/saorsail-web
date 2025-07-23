import {
  ChangeDetectionStrategy, Component, Inject, signal, WritableSignal } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { IconButtonComponent } from '../../../../../shared/components/icon-button/icon-button.component';
import { IconInputComponent } from '../../../../../shared/components/icon-input/icon-input.component';
import { PairedDevice } from '../../../../../shared/services/paired-devices.service';
import { PopupInstance } from '../../../../../shared/components/popup/popup.service';

@Component({
  selector: 'swc-device-pair-qr',
  imports: [
    QRCodeComponent,
    IconButtonComponent,
    IconInputComponent,
  ],
  standalone: true,
  styleUrl: './show-qr-code.component.scss',
  templateUrl: './show-qr-code.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowQrCodeComponent {
  /**
   * The device pairing code, show in the code div and also the QR code
   */
  readonly pairCode: WritableSignal<string | undefined> = signal(undefined);

  /**
   * Constructor
   */
  constructor(
    @Inject('FDM_POPUP') popupInstance: PopupInstance<ShowQrCodeComponent>,
  ) {
    this.pairCode.set(popupInstance.getPopupData<PairedDevice>().code);
  }
}