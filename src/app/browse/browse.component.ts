import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ApplicationService } from '../shared/services/application.service';
import { MultiSelectComponent, SelectItem } from '../shared/components/multi-select/multi-select.component';
import { Application, Category } from '../shared/models/repository.model';
import { ApplicationWidgetComponent } from '../shared/components/application-widget/application-widget.component';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IconInputComponent } from '../shared/components/icon-input/icon-input.component';
import { MultiFilterGroup, Filters, FilterValue, KeywordFilter } from '../shared/lib/filters';
import { LocalizationService } from '../shared/services/localization.service';
import { DefaultOrderFilters, ModelFilters, ModelOrder, OrderBy, OrderDirection } from '../shared/models/filters.model';
import { FormsModule } from '@angular/forms';
import { ShowMoreButtonComponent } from '../shared/components/show-more-button/show-more-button.component';
import { IconComponent } from '../shared/components/icon/icon.component';
import { IconButtonComponent } from '../shared/components/icon-button/icon-button.component';
import { TitleCasePipe } from '@angular/common';
import { LoggerService } from '../shared/services/logger.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'swc-browse',
  standalone: true,
  imports: [
    MultiSelectComponent,
    ApplicationWidgetComponent,
    LoadingIndicatorComponent,
    IconInputComponent,
    FormsModule,
    ShowMoreButtonComponent,
    IconComponent,
    IconButtonComponent,
    TitleCasePipe,
    TranslatePipe,
  ],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent implements OnInit, OnDestroy {
  static ITEMS_PER_PAGE = 20;

  /**
   * Show or hide the filters panel. Only works on mobile.
   */
  readonly showFilters: WritableSignal<boolean> = signal(false);

  readonly loading: WritableSignal<boolean> = signal(true);
  readonly apps: WritableSignal<Application[]> = signal([]);
  readonly selectedOrder: WritableSignal<ModelOrder> = signal({
    by: OrderBy.NAME,
    direction: OrderDirection.DESC
  });
  readonly filters: WritableSignal<Filters> = signal(new Filters([
    new KeywordFilter(),
    new MultiFilterGroup('categories', []),
    new MultiFilterGroup('stars', [
      new FilterValue('1000', '1000+'),
      new FilterValue('500', '500+'),
      new FilterValue('50', '50+')
    ]),
    new MultiFilterGroup('license', [
      new FilterValue('mit', 'MIT'),
      new FilterValue('apache', 'Apache'),
      new FilterValue('gpl', 'GPL'),
      new FilterValue('bsd', 'BSD'),
      new FilterValue('unlicense', 'Unlicensed'),
    ]),
  ]));

  readonly page: WritableSignal<number> = signal(1);
  readonly totalAppsCount: WritableSignal<number> = signal(0);
  readonly filtererAppCount: WritableSignal<number> = signal(0);

  keywords: string = '';

  protected keywordSubject$ = new Subject<string>();
  private cleanup$ = new Subject<any>();

  /**
   * Constructor.
   */
  constructor(
    private applicationService: ApplicationService,
    private activatedRoute: ActivatedRoute,
    private localizationService: LocalizationService,
    private router: Router,
    private loggerService: LoggerService
  ) { }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.addCategoriesToFilters()
      .pipe(
        // Tidy on cleanup
        takeUntil(this.cleanup$),

        // Switch to params
        switchMap(() =>
          this.activatedRoute.queryParams),

        // Merge the params into the filters
        tap(params =>
          this.filters().mergeFromParams(params)),

        // Reload the apps using filters
        tap(() => this.reload())
      )
      .subscribe();

    this.keywordSubject$.pipe(
      takeUntil(this.cleanup$),
      debounceTime(500),
      distinctUntilChanged(),
      tap(keywords => this.updateKeywords(keywords))
    ).subscribe();
  }

  /**
   * Called when the search keywords have been updated.
   */
  updateKeywords(
    keywords: string
  ) {
    const filter = this.filters().getFilter<FilterValue>('keywords');

    if (!filter)
      return

    filter.value = keywords;

    setTimeout(() => this.onFiltersChanged());
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy() {
    this.cleanup$.next(undefined)
    this.cleanup$.complete();
  }

  /**
   * Called when one of the boolean groups has changed.
   */
  onBooleanFilterGroupChanged(
    filterGroup: MultiFilterGroup<boolean>,
    selectItem: SelectItem
  ) {
    filterGroup.setEnabled(selectItem.id, selectItem.selected);
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

    const filters: ModelFilters = new ModelFilters(
      this.selectedOrder(),
      BrowseComponent.ITEMS_PER_PAGE,
      this.page() * BrowseComponent.ITEMS_PER_PAGE - BrowseComponent.ITEMS_PER_PAGE,
      this.filters());

    this.loggerService.info('Reloading...');

    this.applicationService.getApplications(filters)
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

  categories: WritableSignal<Category[]> = signal([]);

  /**
   * Get the categories from the backend, add them to the filters.
   * @private
   */
  private addCategoriesToFilters(): Observable<any> {
    return this.applicationService.getCategories()
      .pipe(
        tap(categories =>
          this.categories.set(categories)),
        tap(categories => {
          const categoriesFilter = this.filters().getFilter<MultiFilterGroup<any>>('categories');

          for (const category of categories) {
            categoriesFilter.addFilterValue(new FilterValue(
              category.id,
              this.localizationService.localizeRecord(category.name)
            ));
          }
        }),
      )
  }

  onOrderChanged(
    $event: ModelOrder
  ) {
    this.selectedOrder.set($event);
    this.onFiltersChanged();
  }

  compareOrder(
    o1: ModelOrder,
    o2: ModelOrder
  ) {
    if (!o1 || !o2) {
      return o1 == o2;
    }

    return o1.by === o2.by && o1.direction == o2.direction;
  }

  getFriendlyOrder(
    order: ModelOrder
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


  getCategorySelectItems(
    filterGroup: MultiFilterGroup<string>
  ) {
    const selectItems: SelectItem[] = [];

    for (const filterValue of filterGroup.values) {
      selectItems.push(<SelectItem> {
        id: filterValue.id,
        title: filterValue.value,
        selected: filterValue.enabled
      })
    }

    return selectItems;
  }

  protected readonly DefaultOrderFilters = DefaultOrderFilters;
}
