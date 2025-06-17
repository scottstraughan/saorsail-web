import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { SettingsBlockItemComponent } from '../../components/setting-block-item/settings-block-item.component';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DisplayTheme, DisplayThemeService, ThemeColor } from '../../../../services/display-theme.service';

@Component({
  imports: [
    SettingsBlockItemComponent,
    NgOptimizedImage,
  ],
  selector: 'swc-settings-display',
  standalone: true,
  styleUrl: './display-settings.component.scss',
  templateUrl: './display-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplaySettingsComponent {
  static icon: string = 'general/phone';
  static title: string = 'Display';

  /**
   * A signal of available themes.
   */
  readonly themes: Signal<DisplayTheme[]>;

  /**
   * A signal to the currently selected theme.
   */
  readonly selectedTheme: Signal<DisplayTheme>;

  /**
   * Constructor.
   * @param displayThemeService
   */
  constructor(
    private displayThemeService: DisplayThemeService,
  ) {
    this.themes = toSignal(
      this.displayThemeService.observeThemes(), { initialValue: [] })

    this.selectedTheme = toSignal(
      this.displayThemeService.observe(), { initialValue: DisplayThemeService.getDefaultLightTheme() });
  }

  /**
   * Get the title of this settings component.
   */
  get title() {
    return DisplaySettingsComponent.title;
  }

  /**
   * Called when a user selects a theme.
   * @param theme
   */
  onSelectTheme(
    theme: DisplayTheme
  ) {
    this.displayThemeService.setTheme(theme);
  }

  /**
   * Called when a user selects a pallet.
   * @param themeColor
   */
  onChoosePallet(
    themeColor: ThemeColor
  ) {
    const theme = this.selectedTheme()
    theme.pallet = themeColor;

    this.displayThemeService.setTheme(theme);
  }

  /**
   * Get all the available pallets.
   */
  getPallets(): ThemeColor[] {
    return DisplayThemeService.COLORS;
  }
}