import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { Application } from '../shared/models/repository.model';
import { LocalizationService } from '../shared/services/localization.service';
import { ApplicationWidgetComponent } from '../shared/components/application-widget/application-widget.component';
import { Title } from '@angular/platform-browser';
import { appTitle } from '../app.config';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';
import { FavoriteService } from '../shared/services/favorite.service';
import { TranslatePipe } from '@ngx-translate/core';
import { IconButtonComponent } from '../shared/components/icon-button/icon-button.component';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'swc-latest',
  standalone: true,
  imports: [
    ApplicationWidgetComponent,
    LoadingIndicatorComponent,
    TranslatePipe,
    IconButtonComponent,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit, OnDestroy {
  protected readonly apps: WritableSignal<Application[]> = signal([]);
  protected readonly loading: WritableSignal<boolean> = signal(true);

  /**
   * Cleanup.
   * @private
   */
  private onDestroy$ = new Subject<void>();

  /**
   * Constructor for latest.
   */
  constructor(
    protected favoriteService: FavoriteService,
    protected localizationService: LocalizationService,
    private title: Title,
  ) {
    this.title.setTitle(`Favorites - ${appTitle}`);
  }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.load()
      .pipe(
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  /**
   * Load the apps from the favorites service.
   */
  private load() {
    this.loading.set(true);

    return this.favoriteService.observeFavorites()
      .pipe(
        tap(apps =>
          this.apps.set(apps)),
        tap(() =>
          this.loading.set(false)),
      );
  }
}
