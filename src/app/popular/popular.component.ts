import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { map, Observable, take, tap } from 'rxjs';
import { Application } from '../shared/models/repository.model';
import { LocalizationService } from '../shared/services/localization.service';
import { ApplicationWidgetComponent } from '../shared/components/application-widget/application-widget.component';
import { ApplicationService } from '../shared/services/application.service';
import { ShowMoreButtonComponent } from '../shared/components/show-more-button/show-more-button.component';
import { appTitle } from '../app.config';
import { Title } from '@angular/platform-browser';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'swc-popular',
  standalone: true,
  imports: [
    ApplicationWidgetComponent,
    ShowMoreButtonComponent,
    LoadingIndicatorComponent,
  ],
  templateUrl: './popular.component.html',
  styleUrls: [
    './../latest/latest.component.scss',
  ]
})
export class PopularComponent implements OnInit {
  // Max items to show per page
  static itemsPerPage = 40;

  readonly apps: WritableSignal<Application[]> = signal([]);
  readonly page: WritableSignal<number> = signal(1);
  readonly loading: WritableSignal<boolean> = signal(true);

  /**
   * Constructor for latest.
   * @param applicationService
   * @param localizationService
   * @param title
   */
  constructor(
    protected applicationService: ApplicationService,
    protected localizationService: LocalizationService,
    private title: Title
  ) {
    this.title.setTitle(`Popular - ${appTitle}`);
  }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.load().subscribe();
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

    return this.applicationService.getPopular(
      PopularComponent.itemsPerPage, (this.page() - 1) * PopularComponent.itemsPerPage)
      .pipe(
        map(result =>
          result.results),
        tap(apps =>
          this.apps.set(this.apps().concat(apps))),
        tap(() =>
          this.loading.set(false)),
        take(1)
      );
  }
}

