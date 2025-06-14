import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  level: LogLevel = environment.logLevel;

  debug(
    ...args: string[]
  ): void {
    if (this.level <= LogLevel.debug) {
      console.debug(args);
    }
  }

  info(
    message: any
  ): void {
    if (this.level <= LogLevel.info) {
      console.info(message);
    }
  }

  warn(
    message: any
  ): void {
    if (this.level <= LogLevel.warn) {
      console.warn(message);
    }
  }

  error(
    message: any
  ): void {
    if (this.level <= LogLevel.error) {
      console.error(message);
    }
  }
}

export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3
}