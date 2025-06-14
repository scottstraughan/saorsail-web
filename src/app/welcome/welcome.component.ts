import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';
import { DatabaseService } from '../shared/services/database.service';
import { Router } from '@angular/router';
import { IconButtonComponent } from '../shared/components/icon-button/icon-button.component';
import { NgOptimizedImage } from '@angular/common';
import { SyncService } from '../shared/services/sync.service';
import { take, tap } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { appTitle } from '../app.config';

@Component({
  selector: 'swc-welcome',
  standalone: true,
  imports: [
    LoadingIndicatorComponent,
    IconButtonComponent,
    NgOptimizedImage
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
  readonly ready: WritableSignal<boolean> = signal(false);

  /**
   * Constructor.
   * @param databaseService
   * @param syncService
   * @param router
   * @param title
   */
  constructor(
    private databaseService: DatabaseService,
    private syncService: SyncService,
    private router: Router,
    private title: Title
  ) {
    this.title.setTitle(`Welcome - ${appTitle}`)
  }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.databaseService.inValidState('categories')
      .then(ready => {
        if (ready) {
          this.router.navigate(['categories'], { replaceUrl: true })
            .then();
        } else {
          this.reset();
        }
      });
  }

  /**
   * Reset the database state.
   */
  reset() {
    this.databaseService.reset()
      .then(() =>
        this.syncService.sync()
          .pipe(
            tap(() => this.ready.set(true)),
            take(1)
          )
          .subscribe()
      )
  }
}
