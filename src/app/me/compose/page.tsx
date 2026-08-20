import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { getMyTomb, ONBOARDING_STEPS } from '@/lib/tomb';
import { EULOGY_PROMPT } from '@/lib/prompt';
import PromptCard from '@/components/PromptCard';

export const dynamic = 'force-dynamic';

export default async function ComposePage() {
  const result = await getMyTomb();
  if (!result) redirect('/');
  if (result.tomb.onboarding_step < ONBOARDING_STEPS) redirect('/me/onboarding');

  return (
    <div className="home-container">
      <Header userName={result.tomb.user_name} />
      <main className="compose-container">
        <p className="compose-lead">
          당신이 어떤 사람이었는지, 저는 모릅니다.
          <br />
          하지만 아는 존재가 하나 있죠.
        </p>
        <p className="publish-warning">
          늘 쓰던 AI에게 아래 질문을 그대로 물어보세요. 돌아온 답을 여기에
          옮겨 적으면, 그게 당신의 추도문이 됩니다.
        </p>

        <PromptCard prompt={EULOGY_PROMPT} />

        {/* Phase 4에서 구현: 붙여넣기 → 문장 선택 각인 → 미리보기 → 게시 */}
        <p className="publish-warning">
          받아온 답을 옮겨 적는 화면은 아직 준비 중입니다.
        </p>
        <Link href="/me" className="compose-cta text-center">
          내 묘비로 돌아가기
        </Link>
      </main>
    </div>
  );
}
