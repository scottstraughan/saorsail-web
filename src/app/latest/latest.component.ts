import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ApplicationService } from '../shared/services/application.service';
import { map, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Application } from '../shared/models/repository.model';
import { LocalizationService } from '../shared/services/localization.service';
import { ApplicationWidgetComponent } from '../shared/components/application-widget/application-widget.component';
import { ShowMoreButtonComponent } from '../shared/components/show-more-button/show-more-button.component';
import { Title } from '@angular/platform-browser';
import { appTitle } from '../app.config';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ModelFilters, OrderBy, OrderDirection } from '../shared/models/filters.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'swc-latest',
  standalone: true,
  imports: [
    ApplicationWidgetComponent,
    ShowMoreButtonComponent,
    LoadingIndicatorComponent,
    TranslatePipe
  ],
  templateUrl: './latest.component.html',
  styleUrl: './latest.component.scss'
})
export class LatestComponent implements OnInit, OnDestroy {
  /**
   * Apps per page.
   * @private
   */
  private static itemsPerPage = 40;

  protected readonly apps: WritableSignal<Application[]> = signal([]);
  protected readonly page: WritableSignal<number> = signal(1);
  protected readonly loading: WritableSignal<boolean> = signal(true);
  protected readonly OrderBy = OrderBy;
  protected orderBy = OrderBy.DATE_ADDED;

  /**
   * Cleanup.
   * @private
   */
  private onDestroy$ = new Subject<void>();

  /**
   * Constructor for latest.
   */
  constructor(
    protected applicationService: ApplicationService,
    protected localizationService: LocalizationService,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.title.setTitle(`Latest - ${appTitle}`);

    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.orderBy = params['sort'] == OrderBy.DATE_UPDATED
            ? OrderBy.DATE_UPDATED
            : OrderBy.DATE_ADDED;
        }),
        switchMap(() => this.load(false)),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.load();
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.page.set(1);
    this.orderBy = OrderBy.DATE_ADDED;
  }

  /**
   * Called when the user presses the show more button.
   */
  onShowMore() {
    this.page.set(this.page() + 1);

    this.load(true)
      .pipe(take(1))
      .subscribe();
  }

  /**
   * Switch to show apps ordered by added.
   */
  onOrderAdded() {
    this.router.navigate(['/latest/' + OrderBy.DATE_ADDED], { queryParams: { page: undefined } })
      .then()
  }

  /**
   * Switch to show apps ordered by updated.
   */
  onOrderUpdated() {
    this.router.navigate(['/latest/' + OrderBy.DATE_UPDATED], { queryParams: { page: undefined } })
      .then()
  }

  /**
   * Load the apps from the application service.
   */
  private load(
    concat: boolean = true
  ) {
    this.loading.set(true);

    const filters: ModelFilters = new ModelFilters(
      {
        by: this.orderBy,
        direction: OrderDirection.DESC
      },
      LatestComponent.itemsPerPage,
      (this.page() - 1) * LatestComponent.itemsPerPage
    );

    return this.applicationService.getApplications(filters)
      .pipe(
        map(result =>
          result.results),
        tap(apps =>
          concat
            ? this.apps.set(this.apps().concat(apps))
            : this.apps.set(apps)),
        tap(() =>
          this.loading.set(false)),
        take(1)
      );
  }
}
