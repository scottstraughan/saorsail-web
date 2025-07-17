import { Component, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { first, forkJoin, map, Observable, switchMap, take, tap } from 'rxjs';
import { ApplicationService } from '../shared/services/application.service';
import { MultiSelectComponent, SelectItem } from '../shared/components/multi-select/multi-select.component';
import { Application } from '../shared/models/repository.model';
import { ApplicationWidgetComponent } from '../shared/components/application-widget/application-widget.component';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IconInputComponent } from '../shared/components/icon-input/icon-input.component';
import { TestBooleanFilterGroup, TestFilter, TestFilters, } from '../shared/services/filter2.service';
import { LocalizationService } from '../shared/services/localization.service';
import { DefaultOrderFilters, Filters, Order, OrderBy, OrderDirection } from '../shared/models/filters.model';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ShowMoreButtonComponent } from '../shared/components/show-more-button/show-more-button.component';
import { IconComponent } from '../shared/components/icon/icon.component';
import { IconButtonComponent } from '../shared/components/icon-button/icon-button.component';

@Component({
  selector: 'swc-browse',
  standalone: true,
  imports: [
    MultiSelectComponent,
    ApplicationWidgetComponent,
    LoadingIndicatorComponent,
    IconInputComponent,
    FormsModule,
    TitleCasePipe,
    ShowMoreButtonComponent,
    IconComponent,
    IconButtonComponent,
  ],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent implements OnInit {
  static ITEMS_PER_PAGE = 20;

  protected readonly MultiSelectComponent = MultiSelectComponent;
  protected readonly DefaultOrderFilters = DefaultOrderFilters;

  /**
   * Show or hide the filters panel. Only works on mobile.
   */
  readonly showFilters: WritableSignal<boolean> = signal(false);

  readonly loading: WritableSignal<boolean> = signal(true);
  readonly apps: WritableSignal<Application[]> = signal([]);
  readonly selectedOrder: WritableSignal<Order> = signal({
    by: OrderBy.NAME,
    direction: OrderDirection.DESC
  });
  readonly filters: WritableSignal<TestFilters> = signal(new TestFilters([
    new TestFilter('keywords', ''),
    new TestBooleanFilterGroup('categories', []),
    new TestBooleanFilterGroup('stars', [
      '1000', '500', '200', '100'
    ], false),
    new TestBooleanFilterGroup('license', [
      'MIT', 'Apache', 'GPL'
    ]),
  ]));

  readonly page: WritableSignal<number> = signal(1);
  readonly totalAppsCount: WritableSignal<number> = signal(0);
  readonly filtererAppCount: WritableSignal<number> = signal(0);

  /**
   * Constructor.
   */
  constructor(
    private applicationService: ApplicationService,
    private activatedRoute: ActivatedRoute,
    private localizationService: LocalizationService,
    private router: Router
  ) { }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.addCategoriesToFilters()
      .pipe(
        switchMap(() =>
          this.activatedRoute.queryParams),

        // Merge the params into the filters
        tap(params =>
          this.filters().mergeFromParams(params)),

        // Reload the apps using filters
        tap(() => this.reload())
      )
      .subscribe();
  }

  /**
   * Called when the keyword string has changed.
   */
  onKeywordsChanged(
    $event: string
  ) {
    const filter = this.filters().getFilter<TestFilter>('keywords');

    if (!filter)
      return

    filter.value = $event;

    this.onFiltersChanged();
  }

  /**
   * Called when one of the boolean groups has changed.
   */
  onBooleanFilterGroupChanged(
    filterGroup: any,
    selectItem: SelectItem
  ) {
    (filterGroup as TestBooleanFilterGroup).setEnabled(selectItem.name, selectItem.selected);
    this.onFiltersChanged();
  }

  /**
   * Called when the filters have changed.
   */
  private onFiltersChanged() {
    let params: Params = {}

    this.page.set(1);

    params = {...params, ...this.filters().toParams()};
    params = {...params, ...{
      'sortBy': this.selectedOrder().by,
      'sortDirection': this.selectedOrder().direction
    }};

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: 'replace'
    }).then();
  }

  /**
   * Reload all the apps.
   */
  private reload(
    concat: boolean = false
  ) {
    if (!concat)
      this.loading.set(true);

    const filters: Filters = {
      order: this.selectedOrder(),
      limit: BrowseComponent.ITEMS_PER_PAGE,
      offset: this.page() * BrowseComponent.ITEMS_PER_PAGE - BrowseComponent.ITEMS_PER_PAGE,
      filters: this.filters(),
    }

    console.log('Reloading', filters);

    this.applicationService.getFiltered(filters)
      .pipe(
        tap(result =>
          this.totalAppsCount.set(result.totalResultsCount)),
        tap(result =>
          this.filtererAppCount.set(result.filteredResultsCount)),
        map(result =>
          result.results),
        tap(apps => {
          if (concat) {
            this.apps.set(this.apps().concat(apps));
          } else {
            this.apps.set(apps);
          }
        }),
        tap(() => this.loading.set(false)),
        take(1)
      )
      .subscribe();
  }

  /**
   * Get the categories from the backend, add them to the filters.
   * @private
   */
  private addCategoriesToFilters(): Observable<any> {
    return this.applicationService.getCategories()
      .pipe(
        map(categories =>
          categories.map(category =>
            this.localizationService.getLocalized(category.name).pipe(first()))),
        switchMap(categoryNamesObservables =>
          forkJoin(categoryNamesObservables)),
        tap(names => {
          const categoriesFilter = this.filters().getFilter<TestBooleanFilterGroup>('categories');
          categoriesFilter.setFromArray(names);
        }),
      )
  }

  onOrderChanged(
    $event: Order
  ) {
    this.selectedOrder.set($event);
    this.onFiltersChanged();
  }

  compareOrder(
    o1: Order,
    o2: Order
  ) {
    if (!o1 || !o2) {
      return o1 == o2;
    }

    return o1.by === o2.by && o1.direction == o2.direction;
  }

  getFriendlyOrder(
    order: Order
  ): string {
    if (order.by && order.direction) {
      return `${order.by.toString().replace('-', ' ')} (${order.direction})`;
    }

    return '';
  }

  onShowMore() {
    this.page.set(this.page() + 1);
    this.reload(true);
  }

  onFiltersClose() {
    this.showFilters.set(false);
  }

  onShowFilters() {
    this.showFilters.set(true);
  }
}
