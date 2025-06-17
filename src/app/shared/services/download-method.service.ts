import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PairedDevice, PairedDevicesService } from './paired-devices.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadMethodService {
  static readonly STORAGE_KEY = 'swc-download-method';

  methods: DownloadMethod[] = [];

  private defaultMethod: DownloadMethod = {
    type: DownloadMethodType.DOWNLOAD,
    name: 'Download the APK',
    icon: 'general/download'
  };

  readonly method$: BehaviorSubject<DownloadMethod> = new BehaviorSubject<DownloadMethod>(this.getDefaultMethod());
  readonly methods$: BehaviorSubject<DownloadMethod[]> = new BehaviorSubject<DownloadMethod[]>(this.methods);

  constructor(
    @Inject(LOCAL_STORAGE) private storageService: StorageService,
    private pairedDevicesService: PairedDevicesService
  ) {
    this.pairedDevicesService.paired()
      .pipe(
        tap(devices => this.methods = [this.defaultMethod].concat(devices.map(device => <DownloadMethod> {
          type: DownloadMethodType.INSTALL,
          icon: 'general/phone',
          name: `Install to ${device.name}`,
          pairedDevice: device
        }))),
        tap(() => this.methods$.next(this.methods))
      )
      .subscribe();

    const savedMethod = this.storageService.get(DownloadMethodService.STORAGE_KEY);

    if (savedMethod) {
      this.method$.next(savedMethod);
    }
  }

  observe(): Observable<DownloadMethod> {
    return this.method$.asObservable();
  }

  observeMethods(): Observable<DownloadMethod[]> {
    return this.methods$.asObservable();
  }

  getDefaultMethod(): DownloadMethod {
    return this.defaultMethod;
  }

  setMethod(
    method: DownloadMethod
  ) {
    this.method$.next(method);
    this.storageService.set(DownloadMethodService.STORAGE_KEY, method);
  }
}

export enum DownloadMethodType {
  DOWNLOAD,
  INSTALL
}

export interface DownloadMethod {
  type: DownloadMethodType
  name: string
  icon: string
  pairedDevice?: PairedDevice
}