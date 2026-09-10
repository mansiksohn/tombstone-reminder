import { createClient } from '@/lib/supabase/client';

/**
 * 구글 로그인 시작. 브라우저에서만 부른다.
 *
 * 이 흐름은 두 곳에서 시작된다 — 랜딩의 '로그인'과 /new의 게시 버튼.
 * 예전에는 CreateFlow 안에만 있었고, 랜딩에 로그인을 붙이면서 같은 코드가
 * 둘로 갈라질 참이었다. 실패를 화면에 드러내는 처리까지 한 곳에 둔다.
 */

/**
 * 로그인을 마친 뒤 데려다줄 곳.
 *
 * OAuth 콜백은 언제나 /new로 돌아온다. 초안을 이어 게시해야 하기
 * 때문인데(auth/callback 참조), 묘비를 보러 로그인한 사람에게는 엉뚱한
 * 도착지다. redirect_to에 쿼리를 붙이면 Supabase 허용목록 매칭이
 * 까다로워져 400을 맞으므로, 갈 곳은 브라우저에 적어두고 /new가 읽어
 * 넘긴다. 초안과 같은 방식이다.
 */
const AFTER_LOGIN_KEY = 'tombstone:after-login';

export interface SignInResult {
  ok: boolean;
  error?: string;
}

export async function signInWithGoogle(
  afterLogin?: string,
): Promise<SignInResult> {
  if (afterLogin) {
    try {
      sessionStorage.setItem(AFTER_LOGIN_KEY, afterLogin);
    } catch {
      // 막혀 있어도 로그인 자체는 된다. /new에 머무를 뿐이다.
    }
  }

  // createClient()는 설정이 없으면 예외를 던진다. 잡지 않으면 uncaught
  // promise로 새어나가 버튼을 눌러도 화면에 아무 일도 일어나지 않는다.
  // 사용자에게는 앱이 그냥 죽은 것처럼 보이므로 반드시 표면화한다.
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 쿼리스트링을 붙이지 않는다. redirect_to에 쿼리가 있으면
        // Supabase 허용목록 매칭이 까다로워져 400을 맞기 쉽다.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { ok: true };
  } catch (cause) {
    console.error('로그인 시작 실패:', cause);
    return {
      ok: false,
      error:
        '로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요. ' +
        '문제가 계속되면 관리자에게 알려주세요.',
    };
  }
}

/** 적어둔 도착지를 꺼내며 지운다. 한 번만 쓰인다. */
export function takeAfterLogin(): string | null {
  try {
    const value = sessionStorage.getItem(AFTER_LOGIN_KEY);
    sessionStorage.removeItem(AFTER_LOGIN_KEY);
    // 열린 리다이렉트를 막는다. 우리 앱 안의 절대 경로만 받는다.
    if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
    return value;
  } catch {
    return null;
  }
}
