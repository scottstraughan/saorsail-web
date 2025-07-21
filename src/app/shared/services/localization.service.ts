import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { ImageReference } from '../models/repository.model';
import { FdroidRepositoryService } from './repository/fdroid-repository.service';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  static readonly DEFAULT_LOCAL = 'en-US';
  static readonly STORAGE_KEY = 'swc-preferred-local';
  static readonly languages: Record<string, Locale> = {
    'de': {
      name: 'German',
      code: 'de',
      icon: true
    },
    'en-US': {
      name: 'English (US)',
      code: 'en-US',
      icon: true
    },
    'es': {
      name: 'Spanish, Castilian',
      code: 'es',
      icon: true
    },
    'fr': {
      name: 'French',
      code: 'fr',
      icon: true
    },
    'it': {
      name: 'Italian',
      code: 'it',
      icon: true
    },
    'zh': {
      name: 'Chinese',
      code: 'zh',
      icon: true
    }
  };

  private locale$: BehaviorSubject<Locale> = new BehaviorSubject<Locale>(
    LocalizationService.languages[LocalizationService.DEFAULT_LOCAL]);

  /**
   * Constructor
   * @param currentLocale
   * @param storageService
   * @param fdroidRepositoryService
   */
  constructor(
    @Inject(LOCALE_ID) public currentLocale: string,
    @Inject(LOCAL_STORAGE) private storageService: StorageService,
    private fdroidRepositoryService: FdroidRepositoryService,
  ) {
    this.setLocal(this.storageService.get(LocalizationService.STORAGE_KEY));
  }

  /**
   * Set the preferred local. If undefined is provided, will use the default.
   * @param newLocal
   */
  setLocal(
    newLocal: string | undefined
  ) {
    if (newLocal === undefined) {
      newLocal = LocalizationService.DEFAULT_LOCAL;
    }

    if (!(newLocal in LocalizationService.languages)) {
      console.warn(`Could not set local ${newLocal} as it is not supported.`);
      return ;
    }

    this.locale$.next(LocalizationService.languages[newLocal]);
    this.storageService.set(LocalizationService.STORAGE_KEY, newLocal);
  }

  /**
   * Get a list of supported locals.
   */
  getSupportedLocals() {
    return LocalizationService.languages;
  }

  /**
   * Get an icon for a given local.
   * @param languageReference
   */
  getLanguageIcon(
    languageReference: Locale
  ): string {
    if (languageReference.icon) {
      return `./assets/icons/flags/${languageReference.code}.svg`;
    }

    return `./assets/icons/flags/missing.svg`;
  }

  /**
   * Get a string translated to the users preferred local. If the preferred local is not available, the string will
   * fall back to the default local.
   * @param record
   */
  localizeRecord<T>(
    record: Record<string, T> | undefined
  ): T {
    if (!record) {
      return <T> 'Unknown'
    }

    if (this.locale$.value.code in record) {
      return record[this.locale$.value.code];
    }

    return record[LocalizationService.DEFAULT_LOCAL];
  }

  localizeRecord$<T>(
    record: Record<string, T> | undefined
  ): Observable<T> {
    return this.locale$
      .pipe(
        map(() => this.localizeRecord(record))
      )
  }

  /**
   * Observe any changes to the preferred local.
   */
  observeLocal(): Observable<Locale> {
    return this.locale$;
  }

  observeLocalChanges(): Observable<Locale> {
    const currentLocal = this.locale$.value;

    return this.observeLocal()
      .pipe(
        filter(local => currentLocal != local));
  }

  /**
   * Get the default local.
   */
  getDefault(): Locale {
    return LocalizationService.languages[LocalizationService.DEFAULT_LOCAL];
  }

  /**
   * Get an image using the preferred local. If no image for the preferred local is available, the function will return
   * an image for the default local.
   * @param imageReference
   * @param fallback
   */
  localizeImageRecord(
    imageReference: Record<string, ImageReference> | undefined,
    fallback: string = '/assets/img/missing.webp'
  ): string {
    if (!imageReference) {
      return fallback;
    }

    return this.fdroidRepositoryService.resolveImageUrl(
      this.localizeRecord(imageReference));
  }

  /**
   * Get an image using the preferred local. If no image for the preferred local is available, the function will return
   * an image for the default local.
   * @param imageReference
   * @param fallback
   */
  localizeImageRecord$(
    imageReference: Record<string, ImageReference> | undefined,
    fallback: string = '/assets/img/missing.webp'
  ): Observable<string> {
    return this.locale$
      .pipe(
        map(() => this.localizeImageRecord(imageReference, fallback))
      )
  }
}

/**
 * Represents a local.
 */
export interface Locale {
  name: string
  code: string
  icon: boolean
}
