import { ChangeDetectionStrategy, Component, Inject, signal, WritableSignal } from '@angular/core';
import { MaskableIconComponent } from '../../components/maskable-icon/maskable-icon.component';
import { PopupInstance } from '../../components/popup/popup.service';

@Component({
  selector: 'swc-error',
  standalone: true,
  imports: [
    MaskableIconComponent
  ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorComponent {
  readonly title: WritableSignal<string> = signal('');
  readonly message: WritableSignal<string> = signal('');
  readonly icon: WritableSignal<string> = signal('general/system');

  constructor(
    @Inject('FDM_POPUP') popupInstance: PopupInstance<ErrorComponent>,
  ) {
    this.title.set(popupInstance.getPopupData<ErrorPopupData>().title);
    this.message.set(popupInstance.getPopupData<ErrorPopupData>().message);

    if (popupInstance.getPopupData<ErrorPopupData>().icon) {
      this.icon.set(popupInstance.getPopupData<ErrorPopupData>().icon);
    }
  }
}

export interface ErrorPopupData {
  title: string
  message: string
  icon: string
}