import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input, OnDestroy,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { Application } from '../../models/repository.model';
import { IconComponent } from '../icon/icon.component';
import { FavoriteService } from '../../services/favorite.service';
import { map, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'swc-favorite-widget',
  standalone: true,
  imports: [
    IconComponent
  ],
  templateUrl: './favorite-widget.component.html',
  styleUrl: './favorite-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoriteWidgetComponent implements OnInit, OnDestroy {
  readonly application = input.required<Application>();
  readonly isFavorite: WritableSignal<boolean> = signal(false);

  /**
   * Used to cleaning up.
   * @private
   */
  private onDestroy$ = new Subject<void>();

  /**
   * Constructor.
   */
  constructor(
    protected favoriteService: FavoriteService,
  ) {  }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.favoriteService.observeFavorites()
      .pipe(
        map(() =>
          this.favoriteService.isFavorite(this.application())),
        tap(favorite =>
          this.isFavorite.set(favorite)),
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
   * Called when a user clicks the host element, used to toggle the favorite.
   */
  @HostListener('click', ['$event'])
  onClick() {
    this.favoriteService.toggleFavorite(this.application());
  }
}