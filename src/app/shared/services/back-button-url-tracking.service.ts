import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BackButtonUrlTrackingService {
  private previousUrl: string | null = '/browse/';
  private currentUrl: string | null = null;

  constructor(
    private router: Router
  ) {
    this.currentUrl = this.router.url;

    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter(event => !event.urlAfterRedirects.includes('/app/')),
      )
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  public getPreviousUrl(): string | null {
    return this.previousUrl;
  }
}