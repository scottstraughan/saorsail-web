import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly permission$: BehaviorSubject<UserNotificationState>
    = new BehaviorSubject<UserNotificationState>(UserNotificationState.NOT_SPECIFIED);

  constructor(
    private window: Window
  ) {
    this.checkPermission();
  }

  create(
    notification: Notification,
  ) {
    if (!this.supported()) {
      return ;
    }

    if (!this.asked()) {
      this.askPermission().then(() =>
        this.createBrowserNotification(notification));

      return ;
    }

    this.createBrowserNotification(notification);
  }

  observePermission(): Observable<UserNotificationState> {
    return this.permission$.asObservable();
  }

  supported(): boolean {
    return ('Notification' in this.window);
  }

  denied(): boolean {
    return Notification.permission === 'denied';
  }

  granted(): boolean {
    return Notification.permission === 'granted';
  }

  asked(): boolean {
    return this.denied() || this.granted();
  }

  askPermission(): Promise<UserNotificationState> {
    return new Promise((resolve) => {
      if (!this.supported()) {
        this.permission$.next(UserNotificationState.UNSUPPORTED);
        resolve(UserNotificationState.UNSUPPORTED);
      }

      Notification.requestPermission().then(() => {
        this.checkPermission();
        resolve(this.permission$.value);
      });
    });
  }

  private checkPermission() {
    if (!this.supported()) {
      this.permission$.next(UserNotificationState.UNSUPPORTED);
    } else if (this.denied()) {
      this.permission$.next(UserNotificationState.DENIED);
    } else if (this.granted()) {
      this.permission$.next(UserNotificationState.GRANTED);
    } else {
      this.permission$.next(UserNotificationState.NOT_SPECIFIED);
    }
  }

  private createBrowserNotification(
    notification: Notification
  ) {
    return new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.icon,
      requireInteraction: notification.persistent
    });
  }
}

/**
 * Represents a notification.
 */
export interface Notification {
  title: string
  body?: string
  icon?: string
  persistent?: boolean
}

/**
 * State of the notification service.
 */
export enum UserNotificationState {
  GRANTED,
  DENIED,
  NOT_SPECIFIED,
  UNSUPPORTED,
}
