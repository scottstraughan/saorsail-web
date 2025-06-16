import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { SettingsBlockItemComponent } from '../../components/setting-block-item/settings-block-item.component';
import { tap } from 'rxjs';
import { DisplayThemeService } from '../../../../services/display-theme.service';

@Component({
  imports: [
    SettingsBlockItemComponent,
  ],
  selector: 'swc-settings-about',
  standalone: true,
  styleUrl: './about-settings.component.scss',
  templateUrl: './about-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutSettingsComponent {
  static icon: string = 'general/info';
  static title: string = 'About';

  readonly darkTheme: WritableSignal<boolean> = signal(false);

  /**
   * Constructor.
   * @param displayThemeService
   */
  constructor(
    private displayThemeService: DisplayThemeService
  ) {
    this.displayThemeService.observe()
      .pipe(tap(theme => this.darkTheme.set(theme.isDark)))
      .subscribe();
  }
}