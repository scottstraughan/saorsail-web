import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { Application, ApplicationVersion } from '../models/repository.model';
import { DownloadMethod } from './download-method.service';
import { LocalizationService } from './localization.service';
import { NotificationService } from './notification.service';
import { FdroidRepositoryService } from './repository/fdroid-repository.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PopupService } from '../components/popup/popup.service';
import { ErrorComponent, ErrorPopupData } from '../popups/error/error.component';
import { environment } from '../../../environments/environment';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class InstallService {
  /**
   * The endpoint to send install requests to.
   */
  private static readonly INSTALL_ENDPOINT_STORAGE_KEY = 'swc-install-endpoint';

  /**
   * The endpoint to send install requests to.
   */
  public static readonly INSTALL_SERVICE_ENDPOINT = environment.installServiceEndpoint;

  /**
   * Observable that can be used to track changes to the install endpoint.
   * @private
   */
  private installServiceEndpoint$: BehaviorSubject<string>
    = new BehaviorSubject<string>(InstallService.INSTALL_SERVICE_ENDPOINT);

  /**
   * Constructor.
   */
  constructor(
    private localizationService: LocalizationService,
    private notificationService: NotificationService,
    private httpClient: HttpClient,
    private popupService: PopupService,
    @Inject(LOCAL_STORAGE) private storageService: StorageService
  ) {
    const installEndpoint = this.storageService.get(InstallService.INSTALL_ENDPOINT_STORAGE_KEY);

    if (installEndpoint) {
      this.installServiceEndpoint$.next(installEndpoint);
    }
  }

  /**
   * Being the process of installing an app to a device.
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
              icon: 'general/error'
            });

          return of(e);
        })
      );
  }

  /**
   * Get a download URL for the APK.
   */
  getDownloadApkUrl(
    version: ApplicationVersion
  ): string {
    return FdroidRepositoryService.REPOSITORY_BASE_URL + version.file.name;
  }

  /**
   * Observe the install endpoint.
   */
  observeEndpoint(): Observable<string> {
    return this.installServiceEndpoint$.asObservable();
  }

  /**
   * Set the endpoint to use.
   * @param endpoint
   */
  setEndpoint(
    endpoint: string
  ) {
    if (!InstallService.isValidUrl(endpoint)) {
      throw new Error('The provided URL is not valid.');
    }

    this.installServiceEndpoint$.next(endpoint);
    this.storageService.set(InstallService.INSTALL_ENDPOINT_STORAGE_KEY, endpoint);
  }

  /**
   * Install to the device by sending the request to the install endpoint.
   * @param installRequest
   * @private
   */
  private installToDevice(
    installRequest: InstallRequest,
  ) {
    return this.httpClient.post(this.installServiceEndpoint$.value + '/install', installRequest, {
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

  /**
   * Check if a URL is valid or not.
   * https://stackoverflow.com/a/43467144
   * @private
   */
  private static isValidUrl(
    url: any
  ): boolean {
    try {
      url = new URL(url);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
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