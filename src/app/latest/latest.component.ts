import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ApplicationService } from '../shared/services/application.service';
import { map, Observable, take, tap } from 'rxjs';
import { Application, ImageReference } from '../shared/models/repository.model';
import { LocalizationService } from '../shared/services/localization.service';
import { AsyncPipe } from '@angular/common';
import { ApplicationWidgetComponent } from '../shared/components/application-widget/application-widget.component';
import { InstallButtonComponent } from '../shared/components/install-button/install-button.component';
import { ShowMoreButtonComponent } from '../shared/components/show-more-button/show-more-button.component';
import { FdroidRepositoryService } from '../shared/services/repository/fdroid-repository.service';
import { Title } from '@angular/platform-browser';
import { appTitle } from '../app.config';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'swc-latest',
  standalone: true,
  imports: [
    AsyncPipe,
    ApplicationWidgetComponent,
    InstallButtonComponent,
    ShowMoreButtonComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './latest.component.html',
  styleUrl: './latest.component.scss'
})
export class LatestComponent implements OnInit {
  // Max items to show per page
  static itemsPerPage = 40;

  readonly firstApp: WritableSignal<Application | undefined> = signal(undefined);
  readonly apps: WritableSignal<Application[]> = signal([]);
  readonly page: WritableSignal<number> = signal(1);
  readonly loading: WritableSignal<boolean> = signal(true);

  /**
   * Constructor for latest.
   * @param applicationService
   * @param localizationService
   * @param fdroidRepositoryService
   * @param title
   */
  constructor(
    protected applicationService: ApplicationService,
    protected localizationService: LocalizationService,
    private fdroidRepositoryService: FdroidRepositoryService,
    private title: Title
  ) {
    this.title.setTitle(`Latest - ${appTitle}`);
  }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.load().subscribe();
  }

  /**
   * Find a good first app to show on the splash panel.
   */
  findFirstApp() {
    for (const app of this.apps()) {
      if (app.metadata.screenshots === undefined) {
        continue;
      }

      if (app.metadata.screenshots['phone'] === undefined) {
        continue;
      }

      return app;
    }

    return undefined;
  }

  /**
   * Find a good first application screenshot to show on the splash panel.
   */
  getFirstAppScreenshot(
    app: Application
  ): Observable<string> {
    return this.localizationService.getLocalized<ImageReference>(app.metadata.screenshots['phone'])
      .pipe(
        map((screenshots: any) =>
          screenshots[0]),
        map(screenshot =>
          this.fdroidRepositoryService.resolveImageUrl(screenshot)),
        take(1)
      )
  }

  /**
   * Called when the user presses the show more button.
   */
  onShowMore() {
    this.page.set(this.page() + 1);
    this.load().subscribe();
  }

  /**
   * Load the apps from the application service.
   */
  private load(): Observable<Application[]> {
    this.loading.set(true);

    return this.applicationService.getLatest(
      LatestComponent.itemsPerPage, (this.page() - 1) * LatestComponent.itemsPerPage)
      .pipe(
        map(result =>
          result.results),
        tap(apps =>
          this.apps.set(this.apps().concat(apps))),
        tap(() =>
          this.firstApp.set(this.findFirstApp())),
        tap(() =>
          this.loading.set(false)),
        take(1)
      );
  }
}
