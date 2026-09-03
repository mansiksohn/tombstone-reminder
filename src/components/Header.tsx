'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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

  const signOut = async () => {
    await createClient().auth.signOut();
    window.location.href = '/';
  };

  const deleteAccount = async () => {
    if (
      !window.confirm('🕳️정말로 계정을 삭제할까요? 다시 되돌릴 수 없습니다.')
    ) {
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
      window.alert('계정 삭제 중 문제가 발생했습니다. 다시 시도해주세요.');
      setDeleting(false);
    }
  };

  return (
    <header className="header">
      <Link href="/" className="header-title">
        묘비log
      </Link>
      <button
        onClick={() => setMenuOpen(true)}
        className="menu-button"
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      {menuOpen && (
        <div className="menu-background" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <button
          onClick={() => setMenuOpen(false)}
          className="menu-close-button"
          aria-label="메뉴 닫기"
        >
          ✖
        </button>

        <div className="menu-content">
          {loggedIn && variant === 'own' && userName && (
            <div className="user-name-container">
              <div className="user-name text-xl font-bold text-soul-green-500">
                {userName}
                <span className="text-white">님</span>
              </div>
            </div>
          )}

          <Link href="/" className="mb-4">
            묘비 만들기
          </Link>

          {loggedIn && (
            <Link href="/me" className="mb-4">
              내 묘비
            </Link>
          )}

          <a
            href="https://airtable.com/appOhndwisYFELv3L/pagJhR86TzB19yBbA/form"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4"
          >
            문의 및 신고
          </a>

          {loggedIn && (
            <>
              <button onClick={signOut}>로그아웃</button>
              <button
                onClick={deleteAccount}
                className="account-delete-button mt-4"
                disabled={deleting}
              >
                {deleting ? '계정 삭제 중…' : '계정 삭제'}
              </button>
            </>
          )}

          <div className="menu-footer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/wsis-logo-dark.svg"
              alt="WSIS 로고"
              className="menu-wsis-logo"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
