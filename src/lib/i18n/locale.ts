export type Locale = 'ko' | 'en';

export const DEFAULT_LOCALE: Locale = 'ko';

export const LOCALE_COOKIE = 'locale';

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'ko' || value === 'en';
}
