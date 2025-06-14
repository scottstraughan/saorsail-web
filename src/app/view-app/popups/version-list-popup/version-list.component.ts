import { ChangeDetectionStrategy, Component, computed, Inject, Signal } from '@angular/core';
import { Application, ApplicationVersion } from '../../../shared/models/repository.model';
import { InstallButtonComponent } from '../../../shared/components/install-button/install-button.component';
import { Router } from '@angular/router';
import { PopupInstance } from '../../../shared/components/popup/popup.service';

@Component({
  selector: 'swc-version-list',
  standalone: true,
  imports: [
    InstallButtonComponent,
  ],
  templateUrl: './version-list.component.html',
  styleUrls: [
    './../../../shared/components/popup/styles/small-simple.scss',
    './version-list.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionListComponent {
  readonly application: Signal<Application>;

  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<VersionListComponent>,
    private router: Router
  ) {
    this.application = computed(() => popupInstance.getPopupData());
  }

  versions(): ApplicationVersion[] {
    return Object.values(this.application().versions);
  }

  fileSizeInMb(fileSize: number) {
    return Math.round(fileSize / 1024 / 1024);
  }

  onVersionChange(version: ApplicationVersion) {
    this.router.navigate([`/app/${this.application().namespace}/${version.manifest.versionName}`])
      .then();

    this.popupInstance.close();
  }
}
