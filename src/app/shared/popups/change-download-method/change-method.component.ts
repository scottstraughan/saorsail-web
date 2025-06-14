import { ChangeDetectionStrategy, Component, Inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SettingsComponent, SettingPanelId } from '../settings/settings.component';
import { MaskableIconComponent } from '../../components/maskable-icon/maskable-icon.component';
import { IconButtonComponent } from '../../components/icon-button/icon-button.component';
import { DownloadMethod, DownloadMethodService } from '../../services/download-method.service';
import { PopupInstance, PopupService } from '../../components/popup/popup.service';

@Component({
  selector: 'swc-change-method',
  standalone: true,
  imports: [
    MaskableIconComponent,
    IconButtonComponent
  ],
  templateUrl: './change-method.component.html',
  styleUrls: [
    '../../../shared/components/popup/styles/small-simple.scss',
    './change-method.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeMethodComponent {
  readonly selectedMethod: Signal<DownloadMethod>;
  readonly methods: Signal<DownloadMethod[]>;

  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<ChangeMethodComponent>,
    private popupService: PopupService,
    private downloadMethodService: DownloadMethodService,
  ) {
    this.selectedMethod = toSignal(
      downloadMethodService.observe(), { initialValue: downloadMethodService.getDefaultMethod() });

    this.methods = toSignal(
      downloadMethodService.observeMethods(), { initialValue: [] });
  }

  onSelectDownloadMethod(method: DownloadMethod) {
    this.downloadMethodService.setMethod(method);
    this.popupInstance.close(method);
  }

  onAddPairedDevice() {
    this.popupService.show(
      SettingsComponent, SettingPanelId.PAIRED_DEVICES);
  }
}
