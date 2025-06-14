import { Component, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { ApplicationService, PartialResult } from '../shared/services/application.service';
import { catchError, Observable, of, switchMap, take, tap } from 'rxjs';
import { MaskableIconComponent } from '../shared/components/maskable-icon/maskable-icon.component';
import { ApplicationWidgetComponent } from '../shared/components/application-widget/application-widget.component';
import { Application, Category } from '../shared/models/repository.model';
import { LocalizationService } from '../shared/services/localization.service';
import { AsyncPipe } from '@angular/common';
import { LoadingState } from '../shared/loading-state';
import { NoticeContainerComponent } from '../shared/components/notice-container/notice-container.component';
import { ShowMoreButtonComponent } from '../shared/components/show-more-button/show-more-button.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { appTitle } from '../app.config';
import { FiltersComponent } from './popups/change-filters/filters.component';
import { PopupService } from '../shared/components/popup/popup.service';
import { Filters, OrderBy, OrderDirection } from '../shared/models/filters.model';
import { LoggerService } from '../shared/services/logger.service';

@Component({
  selector: 'swc-categories',
  standalone: true,
  templateUrl: './categories.component.html',
  imports: [
    MaskableIconComponent,
    AsyncPipe,
    NoticeContainerComponent,
    ApplicationWidgetComponent,
    ShowMoreButtonComponent
  ],
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  static readonly APPLICATIONS_PER_PAGE = 30;

  readonly categories: WritableSignal<Category[]> = signal([]);
  readonly packages: WritableSignal<Application[]> = signal([]);
  readonly selectedCategory: WritableSignal<Category | undefined> = signal(undefined);
  readonly applicationsCategoryTotal: WritableSignal<number> = signal(0);
  readonly loadState: WritableSignal<LoadingState> = signal(LoadingState.LOADING);
  readonly showMoreLoading: WritableSignal<boolean> = signal(false);

  protected readonly LoadingState = LoadingState;
  protected filters: Filters = CategoriesComponent.getDefaultFilters(this.selectedCategory() ?? this.categories()[0]);

  @ViewChild('categoriesList')
  categoriesListElement: ElementRef | undefined;

  /**
   * Constructor.
   * @param packageService
   * @param localizationService
   * @param router
   * @param activatedRoute
   * @param popupService
   * @param title
   * @param loggerService
   */
  constructor(
    protected packageService: ApplicationService,
    protected localizationService: LocalizationService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    private popupService: PopupService,
    private title: Title,
    private loggerService: LoggerService
  ) {
    let routeParams: Params = {};
    const routeObservable = this.activatedRoute.params;

    routeObservable
      .pipe(
        tap(params =>
          routeParams = params),
        switchMap(() =>
          this.activatedRoute.queryParams),
        switchMap(queryParams =>
          this.prepare(routeObservable, routeParams, queryParams)),
        switchMap(() =>
          this.reload(true, true))
      )
      .subscribe();
  }

  /**
   * Called when a user selects a category.
   * @param category
   */
  onCategorySelected(
    category: Category
  ) {
    // Reset the filters to default to clear any filters for previous category
    this.filters = CategoriesComponent.getDefaultFilters(this.selectedCategory() ?? this.categories()[0]);
    this.filters.category = category;
    this.applyFilters();
  }

  /**
   * Get an icon for the provided category.
   * @param category
   */
  getCategoriesIcon(
    category: Category
  ): string {
    return `thin/${category.id.toLowerCase()}`;
  }

  /**
   * Called when a user wishes to see more apps.
   */
  onShowMore() {
    this.filters.offset += CategoriesComponent.APPLICATIONS_PER_PAGE;

    this.showMoreLoading.set(true);

    this.reload(false, false)
      .pipe(
        tap(() => this.showMoreLoading.set(false))
      )
      .subscribe();
  }

  /**
   * Called when a user clicks the change filters button.
   */
  onChangeFilters() {
    this.popupService.show(
      FiltersComponent, this.filters).onClose()
      .pipe(
        tap(filters =>
          this.filters = filters ?? this.filters),
        tap(() =>
          this.applyFilters())
      )
      .subscribe();
  }

  /**
   * Prepare the UI.
   * @param routeObservable
   * @param routeParams
   * @param queryParams
   * @private
   */
  private prepare(
    routeObservable: Observable<any>,
    routeParams: Params,
    queryParams: Params,
  ): Observable<any> {
    if (this.categories().length == 0) {
      this.loggerService.info('Hard reload...');

      routeObservable = routeObservable.pipe(
        switchMap(() =>
          this.packageService.getCategories().pipe(
            tap(categories =>
              this.categories.set(categories)),
            take(1)
          ))
      );
    } else {
      this.loggerService.info('Soft reload...');
    }

    return routeObservable
      .pipe(
        tap(() => this.mergeFiltersFromUrlParams(
          routeParams['categoryId'],
          queryParams['orderBy'],
          queryParams['orderDirection']))
      );
  }

  /**
   * Merge the UI filters.
   * @param categoryId
   * @param orderBy
   * @param orderDirection
   * @private
   */
  private mergeFiltersFromUrlParams(
    categoryId: string | undefined,
    orderBy: string,
    orderDirection: string,
  ) {
    if (Object.values(OrderBy).includes(orderBy as OrderBy)) {
      this.filters.order.by = orderBy as OrderBy;
    }

    if (Object.values(OrderDirection).includes(orderDirection as OrderDirection)) {
      this.filters.order.direction = orderDirection as OrderDirection;
    }

    this.filters.category = categoryId ? this.getCategoryById(categoryId) : this.categories()[0];
  }

  /**
   * Select a category.
   * @param category
   */
  private selectCategory(
    category: Category,
  ) {
    this.selectedCategory.set(category);

    setTimeout(() => {
      this.scrollToActiveCategory();
    }, 400);

    this.localizationService.getLocalized(category.name)
      .pipe(
        tap(localizedName =>
          this.title.setTitle(`${localizedName} - Categories - ${appTitle}`)),
        take(1)
      )
      .subscribe();
  }

  /**
   * Apply the filters by changing the route params (which will cause reload).
   * @private
   */
  private applyFilters() {
    this.router.navigate(['./categories/' + this.filters.category.id], {
      queryParams: {
        'orderBy': this.filters.order.by == ApplicationService.DEFAULT_ORDER_BY
          ? undefined
          : this.filters.order.by,
        'orderDirection': this.filters.order.direction == ApplicationService.DEFAULT_ORDER_DIRECTION
          ? undefined
          : this.filters.order.direction,
      }
    }).then();
  }

  /**
   * Get a category by looking up its id.
   * @param categoryId
   * @private
   */
  private getCategoryById(
    categoryId: string | undefined
  ): Category {
    let selectedCategory = this.categories()[0];

    if (categoryId === undefined) {
      return selectedCategory;
    }

    for (const category of this.categories()) {
      if (category.id === categoryId) {
        selectedCategory = category;
      }
    }

    return selectedCategory;
  }

  /**
   * Load the applications based on the selected scope.
   * @param setLoadingState
   * @param clearPrevious
   * @private
   */
  private reload(
    setLoadingState: boolean = true,
    clearPrevious: boolean = true
  ): Observable<PartialResult<Application>> {
    this.selectCategory(this.filters.category);

    if (setLoadingState)
      this.loadState.set(LoadingState.LOADING);

    return this.packageService.getApplicationsByCategory(this.filters)
      .pipe(
        tap(result => {
          this.applicationsCategoryTotal.set(result.totalResultsCount);
          this.packages.set(clearPrevious
            ? result.results
            : this.packages().concat(result.results));

          if (setLoadingState)
            this.loadState.set(LoadingState.LOAD_SUCCESS);
        }),
        catchError(error => {
          if (setLoadingState)
            this.loadState.set(LoadingState.LOAD_FAILED);

          return of(error);
        }),
        take(1)
      )
  }

  /**
   * Scroll the category menu to the currently selected category.
   * @private
   */
  private scrollToActiveCategory() {
    const element = this.categoriesListElement?.nativeElement.getElementsByClassName('active').item(0);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }

  /**
   * Get default filters.
   * @param category
   */
  static getDefaultFilters(
    category: Category
  ): Filters {
    return {
      category: category,
      order: {
        by: ApplicationService.DEFAULT_ORDER_BY,
        direction: ApplicationService.DEFAULT_ORDER_DIRECTION
      },
      limit: CategoriesComponent.APPLICATIONS_PER_PAGE,
      offset: 0
    }
  }
}
