import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Signal, signal, WritableSignal }
  from '@angular/core';
import { IconButtonComponent } from '../../../../../../components/icon-button/icon-button.component';
import { IconInputComponent } from '../../../../../../components/icon-input/icon-input.component';
import { PopupInstance } from '../../../../../../components/popup/popup.service';
import { InstallService } from '../../../../../../services/install.service';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'swc-change-endpoint',
  imports: [
    IconButtonComponent,
    IconInputComponent,
  ],
  standalone: true,
  styleUrl: './change-endpoint.component.scss',
  templateUrl: './change-endpoint.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeEndpointComponent implements OnInit, OnDestroy {
  /**
   * Endpoint that will be used.
   */
  readonly endpoint: WritableSignal<string> = signal('');

  /**
   * Cleanup related.
   * @private
   */
  private onDestroy: Subject<undefined> = new Subject();

  /**
   * Constructor.
   */
  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<ChangeEndpointComponent>,
    private installService: InstallService
  ) { }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.installService.observeEndpoint()
      .pipe(
        tap(endpoint =>
          this.endpoint.set(endpoint)),
        takeUntil(this.onDestroy)
      )
      .subscribe();
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy(): void {
    this.onDestroy.next(undefined);
    this.onDestroy.complete();
  }

  /**
   * Save any changes and close.
   */
  onSave() {
    try {
      this.installService.setEndpoint(this.endpoint());
      this.popupInstance.close();
    } catch (e) {
      alert(e);
    }
  }

  /**
   * Close the popup.
   */
  onClose() {
    this.popupInstance.close();
  }

  /**
   * Use the default endpoint.
   */
  onUseDefault() {
    this.installService.setEndpoint(InstallService.INSTALL_SERVICE_ENDPOINT);
    this.popupInstance.close();
  }
}