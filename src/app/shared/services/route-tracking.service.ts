import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouteTrackingService {
  private previousUrl: string | null = null;
  private currentUrl: string | null = null;

  constructor(
    private router: Router
  ) {
    this.currentUrl = this.router.url;

    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  public getPreviousUrl(): string | null {
    return this.previousUrl;
  }
}