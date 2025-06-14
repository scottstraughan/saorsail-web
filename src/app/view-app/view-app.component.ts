import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ApplicationService } from '../shared/services/application.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Application, ApplicationVersion } from '../shared/models/repository.model';
import { LocalizationService } from '../shared/services/localization.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { InstallButtonComponent } from '../shared/components/install-button/install-button.component';
import { VersionListComponent } from './popups/version-list-popup/version-list.component';
import { FdroidRepositoryService } from '../shared/services/repository/fdroid-repository.service';
import { PermissionsComponent } from './popups/permissions-popup/permissions.component';
import { PopupService } from '../shared/components/popup/popup.service';
import { appTitle } from '../app.config';
import { Title } from '@angular/platform-browser';
import { TruncatePipe } from '../shared/pipes/truncate.pipe';

@Component({
  selector: 'swc-view-app',
  standalone: true,
  templateUrl: './view-app.component.html',
  imports: [
    AsyncPipe,
    DatePipe,
    InstallButtonComponent,
    TruncatePipe,
  ],
  styleUrl: './view-app.component.scss'
})
export class ViewAppComponent implements OnInit {
  protected readonly Object = Object;

  readonly application: WritableSignal<Application | undefined> = signal(undefined);
  readonly screenshots: WritableSignal<string[]> = signal([]);
  readonly selectedVersion: WritableSignal<ApplicationVersion | undefined> = signal(undefined);
  readonly latestVersion: WritableSignal<ApplicationVersion | undefined> = signal(undefined);

  /**
   * Constructor.
   * @param databaseService
   * @param localizationService
   * @param activatedRoute
   * @param popupService
   * @param fdroidRepositoryService
   * @param router
   * @param title
   */
  constructor(
    protected databaseService: ApplicationService,
    protected localizationService: LocalizationService,
    protected activatedRoute: ActivatedRoute,
    protected popupService: PopupService,
    protected fdroidRepositoryService: FdroidRepositoryService,
    private router: Router,
    private title: Title
  ) { }

  /**
   * @inheritdoc
   */
  ngOnInit() {
    this.activatedRoute.params
      .pipe(tap(params => {
        this.setApplication(params['appPackageName'], params['appPackageVersion'])
          .subscribe();
      }))
      .subscribe()
  }

  setApplication(
    packageName: string,
    version?: string
  ) {
    return this.databaseService.getApplication(packageName)
      .pipe(
        tap(application => console.log(application)),
        tap(application => {
          this.localizationService.getLocalized(application.metadata.name)
            .pipe(
              tap(localizedName =>
                this.title.setTitle(`${localizedName} - ${appTitle}`)),
              take(1)
            )
            .subscribe();
        }),
        tap(application =>
          this.application.set(application)),
        tap(application => {
          try {
            this.setVersion(application, version)
          } catch (e) {
            this.router.navigate([`/app/${application.namespace}`], { replaceUrl: true })
              .then();
          }
        }),
        switchMap(application =>
          this.getScreenshots(application).pipe(
            tap(screenshots => this.screenshots.set(screenshots)),
            take(1)
          )),
        take(1)
      );
  }

  setVersion(
    application: Application,
    version?: string
  ): ApplicationVersion {
    let versionToUse = this.databaseService.getLatestVersion(application);
    this.latestVersion.set(versionToUse);

    if (version) {
      versionToUse = this.databaseService.getVersion(application, version);
    }

    this.selectedVersion.set(versionToUse);
    return versionToUse;
  }

  getScreenshots(
    application: Application
  ): Observable<any> {
    if (!application.metadata.screenshots) {
      return of([]);
    }

    if (!('phone' in application.metadata.screenshots)) {
      return of([]);
    }

    return this.localizationService.getLocalized(application.metadata.screenshots['phone'])
      .pipe(
        map(items =>
          Object.values(items).map(screenshot =>
            this.fdroidRepositoryService.resolveImageUrl(screenshot)))
      )
  }

  getLocalizedFormattedContents(
    contents: Record<string, any> | undefined
  ): Observable<string> {
    if (contents == undefined) {
      return of('');
    }

    return this.localizationService.getLocalized(contents)
      .pipe(
        map(description =>
          description.replaceAll('\n', '<br>'))
      )
  }

  onShowAllVersions() {
    this.popupService.show(
      VersionListComponent, this.application());
  }

  onShowPermissions() {
    this.popupService.show(
      PermissionsComponent, this.selectedVersion());
  }

  onGoToLatest(
    application: Application
  ) {
    this.router.navigate([`/app/${application.namespace}`], { replaceUrl: true })
      .then();
  }

  getDecentAuthorName(authorName: string | undefined) {
    if (!authorName) {
      return 'Not Specified';
    }

    return authorName;
  }

  getUsefulFileSize(
    fileSize: number
  ): string {
    const fileSizeInKb = Math.round(fileSize / 1024);
    const fileSizeInMb = Math.round(fileSize / 1024 / 1024);

    if (fileSizeInKb < 1024) {
      return `${fileSizeInKb} KB`;
    }

    return `${fileSizeInMb} MB`;
  }
}
