import Header from '@/components/Header';
import CreateFlow from '@/components/CreateFlow';
import { getMyTomb, shareUrl } from '@/lib/tomb';
import { EULOGY_PROMPT } from '@/lib/prompt';

export const dynamic = 'force-dynamic';

/**
 * 묘비 만들기. 로그인 없이 들어올 수 있다.
 *
 * 로그인한 사람이면 기존 묘비를 실어 보내 이어서 고칠 수 있게 하고,
 * 아니면 빈 손으로 시작한다. 로그인은 게시 버튼을 누른 뒤에 요구한다.
 */
export default async function NewTombPage() {
  const result = await getMyTomb();
  const tomb = result?.tomb ?? null;

  return (
    <div className="home-container">
      <Header userName={tomb?.user_name} loggedIn={Boolean(result)} />
      <CreateFlow
        prompt={EULOGY_PROMPT}
        loggedIn={Boolean(result)}
        slug={tomb?.slug ?? null}
        shareUrl={tomb ? shareUrl(tomb.slug) : null}
        initialEulogy={tomb?.eulogy ?? null}
        initialSource={tomb?.eulogy_source ?? null}
        initialSentence={tomb?.tomb_name ?? null}
        alreadyPublished={tomb?.status === 'published'}
      />
    </div>
  );
}
