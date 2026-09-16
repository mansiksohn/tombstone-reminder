import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './locale';
import { getDictionary } from './dictionaries';

/**
 * 서버 컴포넌트·서버 액션에서 언어를 읽는다.
 *
 * 토글은 클라이언트에서 document.cookie로 직접 쓴다 — httpOnly가 아니라
 * 서버 액션 없이도 다음 요청부터 서버가 이 값을 본다. 쿠키가 없거나
 * 값이 이상하면 한국어로 되돌아간다.
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** 서버 컴포넌트·서버 액션에서 곧장 번역 사전을 받고 싶을 때. */
export async function getServerDictionary() {
  return getDictionary(await getServerLocale());
}
