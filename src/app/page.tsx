import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import PromptCard from '@/components/PromptCard';
import LandingAnimation from '@/components/LandingAnimation';
import LoginButton from '@/components/LoginButton';
import { EULOGY_PROMPT } from '@/lib/prompt';
import { getMyTomb } from '@/lib/tomb';

export const dynamic = 'force-dynamic';

/**
 * 랜딩 = 안내 + 프롬프트 복사. 아직 묘비가 없는 사람을 위한 화면이다.
 *
 * 로그인은 여기 없다. 게시 직전까지 미뤄뒀다 (/new 참조).
 * 처음 온 사람이 제품을 이해하고 질문을 복사해 가기까지, 아무것도
 * 요구하지 않는 것이 이 화면의 목적이다.
 *
 * 이미 묘비가 있는 사람에게 이 화면은 남의 집 문패다. 자기 묘비를
 * 보려고 '내 묘비 보러가기'를 한 번 더 눌러야 했다. 홈은 자기
 * 묘비여야 한다.
 */
export default async function LandingPage() {
  // 비로그인 방문자는 여기서 왕복을 치르지 않는다. 로그인 쿠키가 없으면
  // auth-js가 네트워크를 타지 않고 즉시 null을 돌려준다.
  const result = await getMyTomb();

  // /me가 '추도문이 없으면 /new로'를 맡고 있으므로 조건을 맞춰둔다.
  // 가입만 하고 아직 만들지 않은 사람은 이 화면에 남아야 한다.
  if (result?.tomb.eulogy) redirect('/me');

  const loggedIn = Boolean(result);

  return (
    <div className="home-container">
      <Header loggedIn={loggedIn} />

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

        {/*
          처음 온 사람에게는 여전히 아무것도 요구하지 않는다. 다만 이미
          묘비를 세워둔 사람은 로그아웃 상태에서 이 화면만 보게 되므로,
          들어올 문이 하나는 있어야 한다.
        */}
        {!loggedIn && <LoginButton />}
      </main>

      <div className="footer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/wsis-logo-dark.svg"
          alt="WSIS 로고"
          className="wsis-logo"
          width={16}
          height={16}
        />
        <p>WSIS</p>
      </div>
    </div>
  );
}
