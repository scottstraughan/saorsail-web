import {
  ChangeDetectionStrategy,
  Component, HostListener,
  Inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap, tap } from 'rxjs';
import { IconInputComponent } from '../../components/icon-input/icon-input.component';
import { NoticeContainerComponent } from '../../components/notice-container/notice-container.component';
import { ApplicationWidgetComponent } from '../../components/application-widget/application-widget.component';
import { Application } from '../../models/repository.model';
import { ApplicationService } from '../../services/application.service';
import { PopupInstance } from '../../components/popup/popup.service';
import { Router } from '@angular/router';

@Component({
  selector: 'swc-search',
  standalone: true,
  imports: [
    IconInputComponent,
    ApplicationWidgetComponent,
    NoticeContainerComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnDestroy {
  /**
   * Used in template.
   * @protected
   */
  protected readonly SearchState = SearchState;

  /**
   * Search state, used for showing progress, loading etc.
   */
  readonly state: WritableSignal<SearchState> = signal(SearchState.NOT_STARTED);

  /**
   * A list of apps wrapped in a signal. Represents the search results.
   */
  readonly apps: WritableSignal<Application[]> = signal([]);

  /**
   * Search value subjected, used for debouncing.
   * @private
   */
  private searchValue$ = new Subject<string>();

  // Reference to search input, used to auto select it on search showing
  @ViewChild('searchElement')
  protected searchElement: IconInputComponent | undefined;

  /**
   * Constructor.
   * @param popupInstance
   * @param databaseService
   * @param router
   */
  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<SearchComponent>,
    private databaseService: ApplicationService,
    private router: Router
  ) { }

  /**
   * @inheritdoc
   */
  ngOnInit() {
    setTimeout(() => {
      if (this.searchElement) {
        this.searchElement.focusInput();
      }
    });

    this.searchValue$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(searchValue =>
          this.searchApps(searchValue))
      )
      .subscribe();
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy() {
    this.searchValue$.unsubscribe();
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKeyPress() {
    if (this.apps().length == 0) {
      return ;
    }

    const firstApp = this.apps()[0];

    this.router.navigate([`/app/${firstApp.namespace}`])
      .then();

    this.popupInstance.close();
  }

  /**
   * Called when the search value has changed.
   * @param $event
   */
  onSearchValueChanged($event: string) {
    this.searchValue$.next($event);
  }

  /**
   * Called when a user clicks on an app.
   */
  onAppClicked() {
    this.popupInstance.close();
  }

  /**
   * Search for apps using a search value.
   * @param searchValue
   * @private
   */
  private searchApps(
    searchValue: string
  ) {
    if (searchValue.length == 0) {
      this.state.set(SearchState.NOT_STARTED);
      return of([]);
    }

    this.state.set(SearchState.SEARCHING);

    return this.databaseService.searchApplications(searchValue)
      .pipe(
        tap(apps =>
          this.apps.set(apps.results)),
        tap((apps) =>
          this.state.set(apps.currentResultsCount > 0 ? SearchState.FOUND : SearchState.NOT_FOUND))
      )
  }
}

/**
 * Represents the state of a search.
 */
enum SearchState {
  NOT_STARTED,
  SEARCHING,
  FOUND,
  NOT_FOUND
}