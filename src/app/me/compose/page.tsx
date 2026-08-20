import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import ComposeFlow from '@/components/ComposeFlow';
import { getMyTomb, ONBOARDING_STEPS, shareUrl } from '@/lib/tomb';
import { EULOGY_PROMPT } from '@/lib/prompt';

export const dynamic = 'force-dynamic';

export default async function ComposePage() {
  const result = await getMyTomb();
  if (!result) redirect('/');

  const { tomb } = result;
  if (tomb.onboarding_step < ONBOARDING_STEPS) redirect('/me/onboarding');

  return (
    <div className="home-container">
      <Header userName={tomb.user_name} />
      <ComposeFlow
        prompt={EULOGY_PROMPT}
        userName={tomb.user_name}
        slug={tomb.slug}
        shareUrl={shareUrl(tomb.slug)}
        initialEulogy={tomb.eulogy}
        initialSource={tomb.eulogy_source}
        initialSentence={tomb.tomb_name}
        alreadyPublished={tomb.status === 'published'}
      />
    </div>
  );
}
