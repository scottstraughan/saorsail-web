import { ChangeDetectionStrategy, Component, computed, input, signal, Signal, WritableSignal } from '@angular/core';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';
import { DownloadMethod, DownloadMethodService, DownloadMethodType } from '../../services/download-method.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Application, ApplicationVersion } from '../../models/repository.model';
import { InstallService } from '../../services/install.service';
import { PopupService } from '../popup/popup.service';
import { ChangeMethodComponent } from '../../popups/change-download-method/change-method.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { take, tap } from 'rxjs';

@Component({
  selector: 'swc-install-button',
  standalone: true,
  imports: [
    MaskableIconComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './install-button.component.html',
  styleUrl: './install-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstallButtonComponent {
  readonly method: Signal<DownloadMethod>;
  readonly application = input.required<Application>();
  readonly version = input.required<ApplicationVersion>();

  readonly loading: WritableSignal<boolean> = signal(false);
  readonly title: Signal<string> = signal('');
  readonly href: Signal<string | undefined> = signal(undefined);

  /**
   * Constructor.
   * @param downloadMethodService
   * @param popupService
   * @param installService
   */
  constructor(
    protected downloadMethodService: DownloadMethodService,
    protected popupService: PopupService,
    protected installService: InstallService,
  ) {
    this.method = toSignal(
      downloadMethodService.observe(), { initialValue: downloadMethodService.getDefaultMethod() });

    this.href = computed(() =>
      this.installService.getDownloadApkUrl(this.version()));

    this.title = computed(() =>
      this.method().type == DownloadMethodType.INSTALL ? 'Install' : 'Download');
  }

  /**
   * Called when the options icon is clicked.
   */
  onOptionsClicked() {
    this.popupService.show(ChangeMethodComponent, undefined)
      .onClose()
      .pipe(
        tap(() =>
          this.onInstall(undefined))
      )
      .subscribe()
  }

  /**
   * Called when a user presses the download/install button.
   * @param event
   */
  onInstall(
    event: MouseEvent | undefined
  ) {
    // Only handle install method, fall back to href for download
    if (this.method().type == DownloadMethodType.INSTALL) {
      if (event) {
        event.preventDefault();
      }

      this.loading.set(true);

      this.installService.install(this.application(), this.method(), this.version())
        .pipe(
          tap(() =>
            this.loading.set(false)),
          take(1)
        )
        .subscribe();

      return;
    }
  }
}