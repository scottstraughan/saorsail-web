import { Component, Inject, Renderer2, signal, Signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MaskableIconComponent } from './shared/components/maskable-icon/maskable-icon.component';
import { LocalizationService } from './shared/services/localization.service';
import { AsyncPipe, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator/loading-indicator.component';
import { DisplayTheme, DisplayThemeService } from './shared/services/display-theme.service';
import { SyncService } from './shared/services/sync.service';
import { take, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PopupService } from './shared/components/popup/popup.service';
import { IconComponent } from './shared/components/icon/icon.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BackButtonUrlTrackingService } from './shared/services/back-button-url-tracking.service';
import { SettingPanelId, SettingsComponent } from './settings/settings.component';
import { ChatbotComponent } from './chatbot/chatbot.component';

@Component({
  selector: 'swc-app',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MaskableIconComponent,
    RouterLinkActive,
    AsyncPipe,
    LoadingIndicatorComponent,
    NgOptimizedImage,
    IconComponent,
    TranslatePipe,
    ChatbotComponent,
  ],
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly syncing: Signal<boolean>;
  readonly darkTheme: WritableSignal<boolean> = signal(false);

  constructor(
    private translate: TranslateService,
    protected localizationService: LocalizationService,
    private syncService: SyncService,
    private popupService: PopupService,
    private router: Router,
    private displayThemeService: DisplayThemeService,
    private renderer: Renderer2,
    private routeTrackingService: BackButtonUrlTrackingService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.translate.addLangs(Object.keys(LocalizationService.languages));
    this.translate.setDefaultLang('en-US');

    this.syncing = toSignal(this.syncService.syncing(), { initialValue: false });

    this.displayThemeService.observe()
      .pipe(tap(theme => this.setTheme(theme)))
      .subscribe();

    this.localizationService.observeLocal()
      .pipe(
        tap(local => this.translate.use(local.code))
      )
      .subscribe();
  }

  private setTheme(
    theme: DisplayTheme
  ) {
    this.displayThemeService.observeThemes()
      .pipe(
        tap(themes => {
          for (const theme of themes) {
            this.renderer.removeClass(this.document.body, theme.class);
          }

          this.renderer.addClass(this.document.body, theme.class);

          if (theme.pallet) {
            this.renderer.setProperty(this.document.body, 'style', `--hint-color: ${theme.pallet.color}`);
          }

          this.darkTheme.set(theme.isDark);
        }),
        take(1)
      )
      .subscribe();
  }

  onSync() {
    this.syncService.sync()
      .pipe(take(1))
      .subscribe()
  }

  isInAppView(): string | undefined {
    const currentUrl = this.router.url;

    if (!currentUrl.startsWith('/app/')) {
      return undefined;
    }

    return './categories/';
  }

  onChangeLang() {
    this.popupService.show(
      SettingsComponent, SettingPanelId.LOCALIZATION);
  }

  onPairDevice() {
    this.popupService.show(
      SettingsComponent, SettingPanelId.PAIRED_DEVICES);
  }

  onShowSettings() {
    this.popupService.show(
      SettingsComponent, undefined);
  }

  onGoBack() {
    const url = this.routeTrackingService.getPreviousUrl()
      ? this.routeTrackingService.getPreviousUrl()
      : '/latest';

    this.router.navigate([url])
      .then();
  }
}