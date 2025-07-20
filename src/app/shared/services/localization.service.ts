import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { ImageReference } from '../models/repository.model';
import { FdroidRepositoryService } from './repository/fdroid-repository.service';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  static readonly DEFAULT_LOCAL = 'en-US';
  static readonly STORAGE_KEY = 'swc-preferred-local';
  static readonly languages: Record<string, Local> = {
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

  private local$: BehaviorSubject<Local> = new BehaviorSubject<Local>(
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
    private fdroidRepositoryService: FdroidRepositoryService
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

    this.local$.next(LocalizationService.languages[newLocal]);
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
    languageReference: Local
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

    if (this.local$.value.code in record) {
      return record[this.local$.value.code];
    }

    return record[LocalizationService.DEFAULT_LOCAL];
  }

  /**
   * Observe any changes to the preferred local.
   */
  observeLocal(): Observable<Local> {
    return this.local$;
  }

  observeLocalChanges(): Observable<Local> {
    const currentLocal = this.local$.value;

    return this.observeLocal()
      .pipe(
        filter(local => currentLocal != local));
  }

  /**
   * Get the default local.
   */
  getDefault(): Local {
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
}

/**
 * Represents a local.
 */
export interface Local {
  name: string
  code: string
  icon: boolean
}
