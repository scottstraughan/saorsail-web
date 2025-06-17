import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

export interface ThemeColor {
  name: string
  color: string
}

@Injectable({
  providedIn: 'root'
})
export class DisplayThemeService {
  static readonly STORAGE_KEY = 'swc-display-theme';

  static readonly COLORS: ThemeColor[] = [
    { name: 'blue', color: 'var(--color-blue)' },
    { name: 'green', color: 'var(--color-green)' },
    { name: 'red', color: 'var(--color-red)' },
    { name: 'yellow', color: 'var(--color-yellow)' }
  ];

  static readonly THEMES: DisplayTheme[] = [
    {
      name: 'Light Mode',
      icon: './assets/img/settings/display/theme-light.webp',
      class: 'theme-light',
      isDark: false,
    },
    {
      name: 'Dark Mode',
      icon: './assets/img/settings/display/theme-dark.webp',
      class: 'theme-dark',
      isDark: true
    }
  ];

  readonly theme$: BehaviorSubject<DisplayTheme> = new BehaviorSubject<DisplayTheme>(
    DisplayThemeService.getDefaultLightTheme());

  constructor(
    @Inject(LOCAL_STORAGE) private storageService: StorageService
  ) {
    const savedTheme = this.storageService.get(DisplayThemeService.STORAGE_KEY);
    const browserDarkMode = this.isBrowserDarkModeEnabled();

    if (savedTheme !== undefined) {
      this.theme$.next(savedTheme);
    } else if (browserDarkMode !== undefined) {
      this.theme$.next(browserDarkMode
        ? DisplayThemeService.getDefaultDarkTheme()
        : DisplayThemeService.getDefaultLightTheme());
    } else {
      this.theme$.next(this.theme$.getValue());
    }
  }

  observe(): Observable<DisplayTheme> {
    return this.theme$.asObservable();
  }

  observeThemes(): Observable<DisplayTheme[]> {
    return of(DisplayThemeService.THEMES);
  }

  setTheme(
    theme: DisplayTheme
  ) {
    theme.pallet = this.theme$.value.pallet;
    this.storageService.set(DisplayThemeService.STORAGE_KEY, theme);
    this.theme$.next(theme);
  }

  private isBrowserDarkModeEnabled(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  static getDefaultLightTheme(): DisplayTheme {
    return DisplayThemeService.THEMES[0];
  }

  static getDefaultDarkTheme(): DisplayTheme {
    return DisplayThemeService.THEMES[1];
  }
}

export interface DisplayTheme {
  name: string
  icon: string
  class: string
  isDark: boolean
  pallet?: ThemeColor
}