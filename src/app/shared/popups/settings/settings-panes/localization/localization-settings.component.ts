import {
  ChangeDetectionStrategy,
  Component,
  computed, HostListener, OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MaskableIconComponent } from '../../../../components/maskable-icon/maskable-icon.component';
import { IconInputComponent } from '../../../../components/icon-input/icon-input.component';
import { Locale, LocalizationService } from '../../../../services/localization.service';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  imports: [
    IconInputComponent,
    MaskableIconComponent,
  ],
  selector: 'swc-settings-localization',
  standalone: true,
  styleUrl: './localization-settings.component.scss',
  templateUrl: './localization-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalizationSettingsComponent implements OnInit {
  static icon: string = 'general/language';
  static title: string = `Localization`;

  readonly languages: WritableSignal<Locale[]> = signal([]);
  readonly filteredLanguages: Signal<Locale[]> = signal([]);
  readonly searchFilterString: WritableSignal<string> = signal('');
  readonly selectedLanguage: Signal<Locale>;

  @ViewChild('searchElement')
  protected searchElement: IconInputComponent | undefined;

  constructor(
    protected localizationService: LocalizationService,
    protected router: Router
  ) {
    this.selectedLanguage = toSignal(
      this.localizationService.observeLocal(),
      { initialValue: localizationService.getDefault() });

    this.filteredLanguages = computed(() => {
      const allLanguages = this.languages();
      const searchString = this.searchFilterString().toLowerCase();

      if (this.searchFilterString().length > 0) {
        return allLanguages.filter(language =>
          language.name.toLowerCase().includes(searchString));
      }

      return allLanguages;
    });
  }

  /**
   * Get the title of this settings component.
   */
  get title() {
    return LocalizationSettingsComponent.title;
  }

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    this.languages.set(Object.values(this.localizationService.getSupportedLocals()));

    setTimeout(() =>
      this.searchElement?.focusInput());
  }

  @HostListener('keydown', ['$event'])
  onGlobalKeyPress(event: KeyboardEvent) {
    const filteredLanguages = this.filteredLanguages();

    if (event.key === 'Enter' && filteredLanguages.length > 0) {
      this.onSelectLanguage(filteredLanguages[0]);
    }
  }

  onSelectLanguage(lang: Locale) {
    this.localizationService.setLocal(lang.code);
  }
}