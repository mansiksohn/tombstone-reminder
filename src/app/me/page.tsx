import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import UserNameSection from '@/components/UserNameSection';
import DatesSection from '@/components/DatesSection';
import TombstoneSection from '@/components/TombstoneSection';
import FlowerSection from '@/components/FlowerSection';
import GroundSection from '@/components/GroundSection';
import DeathMaskSection from '@/components/DeathMaskSection';
import PublishPanel from '@/components/PublishPanel';
import { getFlowers, getMyTomb, ONBOARDING_STEPS, shareUrl } from '@/lib/tomb';

export const dynamic = 'force-dynamic';

export default async function MyTombPage() {
  const result = await getMyTomb();
  if (!result) redirect('/');

  const { tomb } = result;
  if (tomb.onboarding_step < ONBOARDING_STEPS) redirect('/me/onboarding');

  const flowers = await getFlowers(tomb.user_id);
  const published = tomb.status === 'published';

  return (
    <div className="home-container">
      <Header userName={tomb.user_name} />
      <main className="main-content">
        <UserNameSection userName={tomb.user_name} />
        <DatesSection birthDate={tomb.birth_date} deathDate={tomb.death_date} />
        <TombstoneSection tombName={tomb.tomb_name} />
        <FlowerSection
          tombSlug={tomb.slug}
          initialFlowers={flowers.recent}
          total={flowers.total}
          canOffer={published}
        />
        <GroundSection />
        <DeathMaskSection deathmask={tomb.deathmask} />

        {tomb.eulogy ? (
          <section className="obituary-section">
            <div className="obituary-container">
              <p className="eulogy-body">{tomb.eulogy}</p>
            </div>
          </section>
        ) : (
          <section className="obituary-section">
            <div className="obituary-container flex flex-col items-center justify-center gap-4 text-center">
              <p className="break-keep text-grey-999">
                묘비가 비어 있습니다.
                <br />
                당신을 아는 존재에게 물어보세요.
              </p>
              <Link href="/me/compose" className="compose-cta">
                추도문 받아오기
              </Link>
            </div>
          </section>
        )}

        <PublishPanel
          published={published}
          hasEpitaph={Boolean(tomb.tomb_name?.trim())}
          url={shareUrl(tomb.slug)}
        />
      </main>
    </div>
  );
}
