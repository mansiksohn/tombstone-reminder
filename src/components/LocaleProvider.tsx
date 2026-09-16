'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, getDictionary, type Dictionary, type Locale } from '@/lib/i18n';

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * 언어 토글은 페이지 라우팅이 아니라 쿠키 하나로 결정한다 — 언어를
 * 더 늘릴 계획이 없으니 next-intl 같은 라우팅 기반 i18n은 과하다.
 *
 * 쿠키를 httpOnly로 두지 않는 이유: 그래야 여기서 document.cookie로
 * 직접 쓸 수 있다. 서버 컴포넌트(레이아웃·페이지)의 문구는
 * router.refresh()로 다시 그려서 맞추고, 클라이언트 컴포넌트는 이
 * Context로 즉시 바뀐다.
 */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const router = useRouter();

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: getDictionary(locale),
      setLocale: (next) => {
        setLocaleState(next);
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      },
    }),
    [locale, router],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale은 LocaleProvider 안에서만 쓸 수 있습니다.');
  return ctx;
}
