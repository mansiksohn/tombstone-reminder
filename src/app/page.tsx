import Link from 'next/link';
import Header from '@/components/Header';
import PromptCard from '@/components/PromptCard';
import LandingAnimation from '@/components/LandingAnimation';
import { EULOGY_PROMPT } from '@/lib/prompt';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * 랜딩 = 안내 + 프롬프트 복사.
 *
 * 로그인은 여기 없다. 게시 직전까지 미뤄뒀다 (/new 참조).
 * 처음 온 사람이 제품을 이해하고 질문을 복사해 가기까지, 아무것도
 * 요구하지 않는 것이 이 화면의 목적이다.
 */
export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="home-container">
      <Header loggedIn={Boolean(user)} />

      <main className="landing">
        <section className="landing-copy">
          <h2 className="landing-title">
            당신이 떠난 뒤,
            <br />
            당신을 아는 존재는 누구입니까
          </h2>
          <p className="landing-lead">
            늘 쓰던 AI에게 아래 질문을 그대로 물어보세요.
            <br />
            돌아온 답이 당신의 묘비명이 됩니다.
          </p>
        </section>

        <div className="landing-animation">
          <LandingAnimation />
        </div>

        <PromptCard prompt={EULOGY_PROMPT} />

        <Link href="/new" className="landing-cta">
          답변 붙여넣기
        </Link>

        {user && (
          <Link href="/me" className="landing-secondary">
            내 묘비 보러가기
          </Link>
        )}
      </main>

      <div className="footer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/wsis-logo-dark.svg"
          alt="WSIS 로고"
          className="wsis-logo"
        />
        <p>WSIS</p>
      </div>
    </div>
  );
}
