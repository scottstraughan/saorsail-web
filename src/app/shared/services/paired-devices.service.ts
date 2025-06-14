import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { sha256 } from 'js-sha256';

@Injectable({
  providedIn: 'root'
})
export class PairedDevicesService {
  protected pairedDevices: BehaviorSubject<PairedDevice[]> = new BehaviorSubject<PairedDevice[]>([]);

  constructor(
    @Inject(LOCAL_STORAGE) private storageService: StorageService
  ) {
    this.pairedDevices.next(this.fromStorage());
  }

  paired(): Observable<PairedDevice[]> {
    return this.pairedDevices.asObservable();
  }

  static generateCode(): string {
    return sha256(Date.now() + Math.random() + '');
  }

  add(
    deviceName: string,
    code: string
  ) {
    const devices = this.pairedDevices.value;
    devices.push({
      code: code,
      name: deviceName,
      added: Date.now(),
    });

    this.pairedDevices.next(devices);
    this.toStorage();
  }

  delete(
    device: PairedDevice
  ) {
    const devices = [];

    for (const currentDevice of this.pairedDevices.value) {
      if (device.code != currentDevice.code) {
        devices.push(currentDevice);
      }
    }

    this.pairedDevices.next(devices);
    this.toStorage();
  }

  private fromStorage(): PairedDevice[] {
    return this.storageService.get('swc-paired-devices') ?? [];
  }

  private toStorage() {
    this.storageService.set('swc-paired-devices', this.pairedDevices.value);
  }
}

export interface PairedDevice {
  name: string
  code: string
  added: number
}
