import { redirect } from 'next/navigation';
import { getMyTomb, ONBOARDING_STEPS } from '@/lib/tomb';
import OnboardingChat from '@/components/OnboardingChat';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const result = await getMyTomb();
  if (!result) redirect('/');
  if (result.tomb.onboarding_step >= ONBOARDING_STEPS) redirect('/me');

  return <OnboardingChat initialName={result.tomb.user_name} />;
}
