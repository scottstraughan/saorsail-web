import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
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
    'ab': {
      name: 'Abkhazian',
      code: 'ab',
      icon: true
    },
    'aa': {
      name: 'Afar',
      code: 'aa',
      icon: true
    },
    'af': {
      name: 'Afrikaans',
      code: 'af',
      icon: true
    },
    'ak': {
      name: 'Akan',
      code: 'ak',
      icon: true
    },
    'sq': {
      name: 'Albanian',
      code: 'sq',
      icon: true
    },
    'am': {
      name: 'Amharic',
      code: 'am',
      icon: true
    },
    'ar': {
      name: 'Arabic',
      code: 'ar',
      icon: true
    },
    'an': {
      name: 'Aragonese',
      code: 'an',
      icon: true
    },
    'hy': {
      name: 'Armenian',
      code: 'hy',
      icon: true
    },
    'as': {
      name: 'Assamese',
      code: 'as',
      icon: true
    },
    'av': {
      name: 'Avaric',
      code: 'av',
      icon: true
    },
    'ae': {
      name: 'Avestan',
      code: 'ae',
      icon: false
    },
    'ay': {
      name: 'Aymara',
      code: 'ay',
      icon: true
    },
    'az': {
      name: 'Azerbaijani',
      code: 'az',
      icon: true
    },
    'bm': {
      name: 'Bambara',
      code: 'bm',
      icon: true
    },
    'ba': {
      name: 'Bashkir',
      code: 'ba',
      icon: true
    },
    'eu': {
      name: 'Basque',
      code: 'eu',
      icon: true
    },
    'be': {
      name: 'Belarusian',
      code: 'be',
      icon: true
    },
    'bn': {
      name: 'Bengali',
      code: 'bn',
      icon: true
    },
    'bh': {
      name: 'Bihari languages',
      code: 'bh',
      icon: false
    },
    'bi': {
      name: 'Bislama',
      code: 'bi',
      icon: true
    },
    'bs': {
      name: 'Bosnian',
      code: 'bs',
      icon: true
    },
    'br': {
      name: 'Breton',
      code: 'br',
      icon: true
    },
    'bg': {
      name: 'Bulgarian',
      code: 'bg',
      icon: true
    },
    'my': {
      name: 'Burmese',
      code: 'my',
      icon: true
    },
    'ca': {
      name: 'Catalan, Valencian',
      code: 'ca',
      icon: true
    },
    'km': {
      name: 'Central Khmer',
      code: 'km',
      icon: true
    },
    'ch': {
      name: 'Chamorro',
      code: 'ch',
      icon: true
    },
    'ce': {
      name: 'Chechen',
      code: 'ce',
      icon: true
    },
    'ny': {
      name: 'Chichewa, Chewa, Nyanja',
      code: 'ny',
      icon: true
    },
    'zh': {
      name: 'Chinese',
      code: 'zh',
      icon: true
    },
    'cu': {
      name: 'Church Slavonic, Old Bulgarian, Old Church Slavonic',
      code: 'cu',
      icon: false
    },
    'cv': {
      name: 'Chuvash',
      code: 'cv',
      icon: true
    },
    'kw': {
      name: 'Cornish',
      code: 'kw',
      icon: true
    },
    'co': {
      name: 'Corsican',
      code: 'co',
      icon: true
    },
    'cr': {
      name: 'Cree',
      code: 'cr',
      icon: false
    },
    'hr': {
      name: 'Croatian',
      code: 'hr',
      icon: true
    },
    'cs': {
      name: 'Czech',
      code: 'cs',
      icon: true
    },
    'da': {
      name: 'Danish',
      code: 'da',
      icon: true
    },
    'dv': {
      name: 'Divehi, Dhivehi, Maldivian',
      code: 'dv',
      icon: true
    },
    'nl': {
      name: 'Dutch, Flemish',
      code: 'nl',
      icon: true
    },
    'dz': {
      name: 'Dzongkha',
      code: 'dz',
      icon: true
    },
    'en': {
      name: 'English (UK)',
      code: 'en',
      icon: true
    },
    'en-US': {
      name: 'English (US)',
      code: 'en-us',
      icon: true
    },
    'eo': {
      name: 'Esperanto',
      code: 'eo',
      icon: true
    },
    'et': {
      name: 'Estonian',
      code: 'et',
      icon: true
    },
    'ee': {
      name: 'Ewe',
      code: 'ee',
      icon: true
    },
    'fo': {
      name: 'Faroese',
      code: 'fo',
      icon: true
    },
    'fj': {
      name: 'Fijian',
      code: 'fj',
      icon: true
    },
    'fi': {
      name: 'Finnish',
      code: 'fi',
      icon: true
    },
    'fr': {
      name: 'French',
      code: 'fr',
      icon: true
    },
    'ff': {
      name: 'Fulah',
      code: 'ff',
      icon: false
    },
    'gd': {
      name: 'Gaelic, Scottish Gaelic',
      code: 'gd',
      icon: true
    },
    'gl': {
      name: 'Galician',
      code: 'gl',
      icon: true
    },
    'lg': {
      name: 'Ganda',
      code: 'lg',
      icon: true
    },
    'ka': {
      name: 'Georgian',
      code: 'ka',
      icon: true
    },
    'de': {
      name: 'German',
      code: 'de',
      icon: true
    },
    'ki': {
      name: 'Gikuyu, Kikuyu',
      code: 'ki',
      icon: true
    },
    'el': {
      name: 'Greek (Modern)',
      code: 'el',
      icon: true
    },
    'kl': {
      name: 'Greenlandic, Kalaallisut',
      code: 'kl',
      icon: true
    },
    'gn': {
      name: 'Guarani',
      code: 'gn',
      icon: true
    },
    'gu': {
      name: 'Gujarati',
      code: 'gu',
      icon: true
    },
    'ht': {
      name: 'Haitian, Haitian Creole',
      code: 'ht',
      icon: true
    },
    'ha': {
      name: 'Hausa',
      code: 'ha',
      icon: true
    },
    'he': {
      name: 'Hebrew',
      code: 'he',
      icon: true
    },
    'hz': {
      name: 'Herero',
      code: 'hz',
      icon: false
    },
    'hi': {
      name: 'Hindi',
      code: 'hi',
      icon: true
    },
    'ho': {
      name: 'Hiri Motu',
      code: 'ho',
      icon: true
    },
    'hu': {
      name: 'Hungarian',
      code: 'hu',
      icon: true
    },
    'is': {
      name: 'Icelandic',
      code: 'is',
      icon: true
    },
    'io': {
      name: 'Ido',
      code: 'io',
      icon: true
    },
    'ig': {
      name: 'Igbo',
      code: 'ig',
      icon: true
    },
    'id': {
      name: 'Indonesian',
      code: 'id',
      icon: true
    },
    'ia': {
      name: 'Interlingua (International Auxiliary Language Association)',
      code: 'ia',
      icon: true
    },
    'ie': {
      name: 'Interlingue',
      code: 'ie',
      icon: true
    },
    'iu': {
      name: 'Inuktitut',
      code: 'iu',
      icon: false
    },
    'ik': {
      name: 'Inupiaq',
      code: 'ik',
      icon: false
    },
    'ga': {
      name: 'Irish',
      code: 'ga',
      icon: true
    },
    'it': {
      name: 'Italian',
      code: 'it',
      icon: true
    },
    'ja': {
      name: 'Japanese',
      code: 'ja',
      icon: true
    },
    'jv': {
      name: 'Javanese',
      code: 'jv',
      icon: true
    },
    'kn': {
      name: 'Kannada',
      code: 'kn',
      icon: true
    },
    'kr': {
      name: 'Kanuri',
      code: 'kr',
      icon: true
    },
    'ks': {
      name: 'Kashmiri',
      code: 'ks',
      icon: true
    },
    'kk': {
      name: 'Kazakh',
      code: 'kk',
      icon: true
    },
    'rw': {
      name: 'Kinyarwanda',
      code: 'rw',
      icon: true
    },
    'kv': {
      name: 'Komi',
      code: 'kv',
      icon: true
    },
    'kg': {
      name: 'Kongo',
      code: 'kg',
      icon: true
    },
    'ko': {
      name: 'Korean',
      code: 'ko',
      icon: true
    },
    'kj': {
      name: 'Kwanyama, Kuanyama',
      code: 'kj',
      icon: false
    },
    'ku': {
      name: 'Kurdish',
      code: 'ku',
      icon: true
    },
    'ky': {
      name: 'Kyrgyz',
      code: 'ky',
      icon: true
    },
    'lo': {
      name: 'Lao',
      code: 'lo',
      icon: true
    },
    'la': {
      name: 'Latin',
      code: 'la',
      icon: true
    },
    'lv': {
      name: 'Latvian',
      code: 'lv',
      icon: true
    },
    'lb': {
      name: 'Letzeburgesch, Luxembourgish',
      code: 'lb',
      icon: true
    },
    'li': {
      name: 'Limburgish, Limburgan, Limburger',
      code: 'li',
      icon: false
    },
    'ln': {
      name: 'Lingala',
      code: 'ln',
      icon: true
    },
    'lt': {
      name: 'Lithuanian',
      code: 'lt',
      icon: true
    },
    'lu': {
      name: 'Luba-Katanga',
      code: 'lu',
      icon: true
    },
    'mk': {
      name: 'Macedonian',
      code: 'mk',
      icon: true
    },
    'mg': {
      name: 'Malagasy',
      code: 'mg',
      icon: true
    },
    'ms': {
      name: 'Malay',
      code: 'ms',
      icon: true
    },
    'ml': {
      name: 'Malayalam',
      code: 'ml',
      icon: true
    },
    'mt': {
      name: 'Maltese',
      code: 'mt',
      icon: true
    },
    'gv': {
      name: 'Manx',
      code: 'gv',
      icon: true
    },
    'mi': {
      name: 'Maori',
      code: 'mi',
      icon: true
    },
    'mr': {
      name: 'Marathi',
      code: 'mr',
      icon: true
    },
    'mh': {
      name: 'Marshallese',
      code: 'mh',
      icon: true
    },
    'ro': {
      name: 'Moldovan, Moldavian, Romanian',
      code: 'ro',
      icon: true
    },
    'mn': {
      name: 'Mongolian',
      code: 'mn',
      icon: true
    },
    'na': {
      name: 'Nauru',
      code: 'na',
      icon: true
    },
    'nv': {
      name: 'Navajo, Navaho',
      code: 'nv',
      icon: false
    },
    'nd': {
      name: 'Northern Ndebele',
      code: 'nd',
      icon: true
    },
    'ng': {
      name: 'Ndonga',
      code: 'ng',
      icon: false
    },
    'ne': {
      name: 'Nepali',
      code: 'ne',
      icon: true
    },
    'se': {
      name: 'Northern Sami',
      code: 'se',
      icon: true
    },
    'no': {
      name: 'Norwegian',
      code: 'no',
      icon: true
    },
    'nb': {
      name: 'Norwegian Bokmål',
      code: 'nb',
      icon: true
    },
    'nn': {
      name: 'Norwegian Nynorsk',
      code: 'nn',
      icon: true
    },
    'ii': {
      name: 'Nuosu, Sichuan Yi',
      code: 'ii',
      icon: false
    },
    'oc': {
      name: 'Occitan (post 1500)',
      code: 'oc',
      icon: true
    },
    'oj': {
      name: 'Ojibwa',
      code: 'oj',
      icon: false
    },
    'or': {
      name: 'Oriya',
      code: 'or',
      icon: true
    },
    'om': {
      name: 'Oromo',
      code: 'om',
      icon: true
    },
    'os': {
      name: 'Ossetian, Ossetic',
      code: 'os',
      icon: true
    },
    'pi': {
      name: 'Pali',
      code: 'pi',
      icon: false
    },
    'pa': {
      name: 'Panjabi, Punjabi',
      code: 'pa',
      icon: true
    },
    'ps': {
      name: 'Pashto, Pushto',
      code: 'ps',
      icon: true
    },
    'fa': {
      name: 'Persian',
      code: 'fa',
      icon: true
    },
    'pl': {
      name: 'Polish',
      code: 'pl',
      icon: true
    },
    'pt': {
      name: 'Portuguese',
      code: 'pt',
      icon: true
    },
    'qu': {
      name: 'Quechua',
      code: 'qu',
      icon: true
    },
    'rm': {
      name: 'Romansh',
      code: 'rm',
      icon: true
    },
    'rn': {
      name: 'Rundi',
      code: 'rn',
      icon: true
    },
    'ru': {
      name: 'Russian',
      code: 'ru',
      icon: true
    },
    'sm': {
      name: 'Samoan',
      code: 'sm',
      icon: true
    },
    'sg': {
      name: 'Sango',
      code: 'sg',
      icon: true
    },
    'sa': {
      name: 'Sanskrit',
      code: 'sa',
      icon: false
    },
    'sc': {
      name: 'Sardinian',
      code: 'sc',
      icon: true
    },
    'sr': {
      name: 'Serbian',
      code: 'sr',
      icon: true
    },
    'sn': {
      name: 'Shona',
      code: 'sn',
      icon: true
    },
    'sd': {
      name: 'Sindhi',
      code: 'sd',
      icon: true
    },
    'si': {
      name: 'Sinhala, Sinhalese',
      code: 'si',
      icon: true
    },
    'sk': {
      name: 'Slovak',
      code: 'sk',
      icon: true
    },
    'sl': {
      name: 'Slovenian',
      code: 'sl',
      icon: true
    },
    'so': {
      name: 'Somali',
      code: 'so',
      icon: true
    },
    'st': {
      name: 'Sotho, Southern',
      code: 'st',
      icon: true
    },
    'nr': {
      name: 'South Ndebele',
      code: 'nr',
      icon: true
    },
    'es': {
      name: 'Spanish, Castilian',
      code: 'es',
      icon: true
    },
    'su': {
      name: 'Sundanese',
      code: 'su',
      icon: true
    },
    'sw': {
      name: 'Swahili',
      code: 'sw',
      icon: true
    },
    'ss': {
      name: 'Swati',
      code: 'ss',
      icon: true
    },
    'sv': {
      name: 'Swedish',
      code: 'sv',
      icon: true
    },
    'tl': {
      name: 'Tagalog',
      code: 'tl',
      icon: true
    },
    'ty': {
      name: 'Tahitian',
      code: 'ty',
      icon: true
    },
    'tg': {
      name: 'Tajik',
      code: 'tg',
      icon: true
    },
    'ta': {
      name: 'Tamil',
      code: 'ta',
      icon: true
    },
    'tt': {
      name: 'Tatar',
      code: 'tt',
      icon: true
    },
    'te': {
      name: 'Telugu',
      code: 'te',
      icon: true
    },
    'th': {
      name: 'Thai',
      code: 'th',
      icon: true
    },
    'bo': {
      name: 'Tibetan',
      code: 'bo',
      icon: true
    },
    'ti': {
      name: 'Tigrinya',
      code: 'ti',
      icon: true
    },
    'to': {
      name: 'Tonga (Tonga Islands)',
      code: 'to',
      icon: true
    },
    'ts': {
      name: 'Tsonga',
      code: 'ts',
      icon: false
    },
    'tn': {
      name: 'Tswana',
      code: 'tn',
      icon: true
    },
    'tr': {
      name: 'Turkish',
      code: 'tr',
      icon: true
    },
    'tk': {
      name: 'Turkmen',
      code: 'tk',
      icon: true
    },
    'tw': {
      name: 'Twi',
      code: 'tw',
      icon: false
    },
    'ug': {
      name: 'Uighur, Uyghur',
      code: 'ug',
      icon: true
    },
    'uk': {
      name: 'Ukrainian',
      code: 'uk',
      icon: true
    },
    'ur': {
      name: 'Urdu',
      code: 'ur',
      icon: true
    },
    'uz': {
      name: 'Uzbek',
      code: 'uz',
      icon: true
    },
    've': {
      name: 'Venda',
      code: 've',
      icon: false
    },
    'vi': {
      name: 'Vietnamese',
      code: 'vi',
      icon: true
    },
    'vo': {
      name: 'Volap_k',
      code: 'vo',
      icon: true
    },
    'wa': {
      name: 'Walloon',
      code: 'wa',
      icon: false
    },
    'cy': {
      name: 'Welsh',
      code: 'cy',
      icon: true
    },
    'fy': {
      name: 'Western Frisian',
      code: 'fy',
      icon: true
    },
    'wo': {
      name: 'Wolof',
      code: 'wo',
      icon: false
    },
    'xh': {
      name: 'Xhosa',
      code: 'xh',
      icon: true
    },
    'yi': {
      name: 'Yiddish',
      code: 'yi',
      icon: true
    },
    'yo': {
      name: 'Yoruba',
      code: 'yo',
      icon: true
    },
    'za': {
      name: 'Zhuang, Chuang',
      code: 'za',
      icon: false
    },
    'zu': {
      name: 'Zulu',
      code: 'zu',
      icon: true
    }
  };

  private local$: BehaviorSubject<Local> = new BehaviorSubject<Local>(
    LocalizationService.languages[LocalizationService.DEFAULT_LOCAL]);

  /**
   * Constructor
   * @param storageService
   * @param fdroidRepositoryService
   */
  constructor(
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
  getLocalized<T>(
    record: Record<string, T> | undefined
  ): Observable<T> {
    return this.local$
      .pipe(
        map(() => {
          if (!record) {
            return <T> 'Unknown';
          }

          if (this.local$.value.code in record) {
            return record[this.local$.value.code];
          }

          return record[LocalizationService.DEFAULT_LOCAL];
        })
      )
  }

  /**
   * Observe any changes to the preferred local.
   */
  observeLocal(): Observable<Local> {
    return this.local$;
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
  resolveLocalizedImageUrl(
    imageReference: Record<string, ImageReference> | undefined,
    fallback: string = '/assets/img/missing.webp'
  ): Observable<string> {
    if (!imageReference) {
      return of(fallback);
    }

    return this.getLocalized(imageReference)
      .pipe(
        map(imageReference =>
          this.fdroidRepositoryService.resolveImageUrl(imageReference)),
      )
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
