import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { Application, ApplicationVersion } from '../models/repository.model';
import { DownloadMethod } from './download-method.service';
import { LocalizationService } from './localization.service';
import { NotificationService } from './notification.service';
import { FdroidRepositoryService } from './repository/fdroid-repository.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PopupService } from '../components/popup/popup.service';
import { ErrorComponent, ErrorPopupData } from '../popups/error/error.component';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstallService {
  /**
   * The endpoint to send install requests to.
   */
  static readonly INSTALL_SERVICE_ENDPOINT = environment.installServiceEndpoint;

  /**
   * Constructor.
   * @param localizationService
   * @param notificationService
   * @param httpClient
   * @param popupService
   */
  constructor(
    private localizationService: LocalizationService,
    private notificationService: NotificationService,
    private httpClient: HttpClient,
    private popupService: PopupService
  ) { }

  /**
   * Being the process of installing an app to a device.
   * @param application
   * @param method
   * @param version
   */
  install(
    application: Application,
    method: DownloadMethod,
    version: ApplicationVersion
  ): Observable<any> {
    if (!method.pairedDevice) {
      return of();
    }

    const pairedDevice = method.pairedDevice;
    const localizationResult = {
      'title': '',
      'icon': ''
    };

    return this.localizationService.getLocalized(application.metadata.name)
      .pipe(
        tap(title =>
          localizationResult.title = title),
        switchMap(() =>
          this.localizationService.resolveLocalizedImageUrl(application.metadata.icon)),
        tap(icon =>
          localizationResult.icon = icon),
        map(() => {
          return <InstallRequest> {
            devicePairCode: pairedDevice.code,
            appNamespace: application.namespace,
            appIconUrl: localizationResult.icon,
            appName: localizationResult.title,
            appVersion: version.manifest.versionName,
            appPackageDownloadUrl: this.getDownloadApkUrl(version)
          }
        }),
        switchMap(installRequest =>
          this.installToDevice(installRequest)),
        tap(() => {
          this.notificationService.create({
            title: `Installing ${localizationResult.title} to ${pairedDevice.name}`,
            body: `${localizationResult.title} should start installing on ${pairedDevice.name} shortly, if not, check settings.`,
            icon: localizationResult.icon
          })
        }),
        catchError((e: HttpErrorResponse) => {
          this.popupService.show(
            ErrorComponent, <ErrorPopupData> {
              title: 'Failed to Install',
              message: e.message,
              icon: 'thin/error'
            });

          return of(e);
        })
      );
  }

  /**
   * Get a download URL for the APK.
   * @param version
   */
  getDownloadApkUrl(
    version: ApplicationVersion
  ): string {
    return FdroidRepositoryService.REPOSITORY_BASE_URL + version.file.name;
  }

  /**
   * Install to the device by sending the request to the install endpoint.
   * @param installRequest
   * @private
   */
  private installToDevice(
    installRequest: InstallRequest,
  ) {
    return this.httpClient.post(InstallService.INSTALL_SERVICE_ENDPOINT, installRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      },
      responseType: 'text'
    }).pipe(
      tap(() =>
        console.log(installRequest)),
    );
  }
}

/**
 * Represents the request that is send to the install endpoint.
 */
interface InstallRequest {
  devicePairCode: string
  appNamespace: string
  appIconUrl: string
  appName: string
  appVersion: string
  appPackageDownloadUrl: string
}