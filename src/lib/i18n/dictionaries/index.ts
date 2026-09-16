import type { Locale } from '../locale';
import type { Dictionary } from '../dictionary';
import { ko } from './ko';
import { en } from './en';

const dictionaries: Record<Locale, Dictionary> = { ko, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
