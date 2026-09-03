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
import { getFlowers, getMyTomb, shareUrl } from '@/lib/tomb';

export const dynamic = 'force-dynamic';

/**
 * 내 묘비 = 꾸미기 화면.
 *
 * 이름·생일·데스마스크는 예전에 온보딩 챗에서 묘비를 만들기 전에
 * 물었지만, 지금은 전부 선택 사항이다. 묘비는 이미 서 있고 여기서
 * 다듬을 뿐이다.
 */
export default async function MyTombPage() {
  const result = await getMyTomb();
  if (!result) redirect('/');

  const { tomb } = result;

  // 추도문이 없으면 아직 묘비를 만들지 않은 것이다. 만들기로 보낸다.
  if (!tomb.eulogy) redirect('/new');

  const flowers = await getFlowers(tomb.user_id);
  const published = tomb.status === 'published';

  return (
    <div className="home-container">
      <Header userName={tomb.user_name} loggedIn />
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

        <section className="obituary-section">
          <div className="obituary-container">
            <p className="eulogy-body">{tomb.eulogy}</p>
          </div>
        </section>

        <div className="px-4">
          <Link href="/new" className="unpublish-button block text-center">
            추도문 다시 받아오기
          </Link>
        </div>

        <PublishPanel
          published={published}
          hasEpitaph={Boolean(tomb.tomb_name?.trim())}
          url={shareUrl(tomb.slug)}
        />
      </main>
    </div>
  );
}
