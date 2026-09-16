'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from './LocaleProvider';

interface Props {
  userName?: string | null;
  /** 로그인 전에는 계정 관련 항목을 숨긴다. */
  loggedIn?: boolean;
  /** 공개 묘비 페이지에서는 남의 묘비를 보고 있으므로 이름을 쓰지 않는다. */
  variant?: 'own' | 'public';
}

export default function Header({
  userName,
  loggedIn = false,
  variant = 'own',
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { locale, t, setLocale } = useLocale();

  const signOut = async () => {
    await createClient().auth.signOut();
    window.location.href = '/';
  };

  const deleteAccount = async () => {
    if (!window.confirm(t.header.deleteConfirm)) {
      return;
    }

    setDeleting(true);
    try {
      // 구 코드는 브라우저에서 supabase.auth.admin.deleteUser()를 불렀다.
      // service_role 키가 필요한 API라 항상 실패했고, 묘비 행만 지운 채
      // 계정은 남겨두고 로그아웃시켰다. 이제 서버 라우트가 처리한다.
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      await signOut();
    } catch (error) {
      console.error('계정 삭제 실패:', error);
      window.alert(t.header.deleteFailedAlert);
      setDeleting(false);
    }
  };

  return (
    <>
      {/*
        메뉴 오버레이·배경은 header 밖으로 뺐다. header에 backdrop-blur를
        올린 뒤로, position:fixed인 이 둘이 뷰포트가 아니라 80px짜리
        header를 기준으로 자리잡아 드로어가 헤더 높이만큼 눌린 띠로
        찌그러졌다 — backdrop-filter가 있는 조상은 fixed 자손의 containing
        block이 된다. header 바깥의 형제로 두면 이 문제 자체가 없어진다.
      */}
      <header className="header">
        <Link href="/" className="header-title">
          묘비log
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          className="menu-button"
          aria-label={t.header.menuOpenAria}
        >
          ☰
        </button>
      </header>

      {menuOpen && (
        <div className="menu-background" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <button
          onClick={() => setMenuOpen(false)}
          className="menu-close-button"
          aria-label={t.header.menuCloseAria}
        >
          ✖
        </button>

        <div className="menu-content">
          {loggedIn && variant === 'own' && userName && (
            <div className="user-name-container">
              <div className="user-name text-xl font-bold text-soul-green-500">
                {userName}
                <span className="text-white">{t.header.nameSuffix}</span>
              </div>
            </div>
          )}

          {/*
            /를 가리키면 안 된다. 묘비가 있는 사람은 거기서 /me로 튕겨
            나가므로, 만들기로 가려던 사람이 제자리로 되돌아온다.
          */}
          {/*
            지금 있는 페이지를 가리키는 링크를 누르면 Next는 이동할
            경로가 없으니 아무 일도 안 한다 — 메뉴만 열린 채로 남아
            눌러도 반응이 없는 것처럼 보인다. onClick으로 메뉴를 직접
            닫아, 어느 페이지에서 눌러도 최소한 메뉴는 닫히게 한다.
          */}
          <Link href="/new" className="mb-4" onClick={() => setMenuOpen(false)}>
            {t.header.createTomb}
          </Link>

          {loggedIn && (
            <Link href="/me" className="mb-4" onClick={() => setMenuOpen(false)}>
              {t.header.myTomb}
            </Link>
          )}

          <a
            href="https://airtable.com/appOhndwisYFELv3L/pagJhR86TzB19yBbA/form"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4"
          >
            {t.header.contact}
          </a>

          {/* 언어는 두 개뿐이라 드롭다운 없이 토글 하나로 충분하다. */}
          <button
            type="button"
            onClick={() => {
              setLocale(locale === 'ko' ? 'en' : 'ko');
              setMenuOpen(false);
            }}
            className="mb-4"
          >
            {t.header.languageToggle}
          </button>

          {loggedIn && (
            <>
              <button onClick={signOut}>{t.header.signOut}</button>
              <button
                onClick={deleteAccount}
                className="account-delete-button mt-4"
                disabled={deleting}
              >
                {deleting ? t.header.deletingAccount : t.header.deleteAccount}
              </button>
            </>
          )}

          <div className="menu-footer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/wsis-logo-dark.svg"
              alt={t.header.wsisLogoAlt}
              className="menu-wsis-logo"
              width={16}
              height={16}
            />
          </div>
        </div>
      </div>
    </>
  );
}
