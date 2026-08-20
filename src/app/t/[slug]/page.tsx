import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import DatesSection from '@/components/DatesSection';
import TombstoneSection from '@/components/TombstoneSection';
import FlowerSection from '@/components/FlowerSection';
import GroundSection from '@/components/GroundSection';
import DeathMaskSection from '@/components/DeathMaskSection';
import { getFlowers, getPublishedTomb, shareUrl } from '@/lib/tomb';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 묘비마다 고유한 OG 태그. CRA SPA에서는 불가능했던 부분이고,
 * 공유가 제품의 중심이 된 이상 Next로 옮긴 가장 큰 실익이다.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tomb = await getPublishedTomb(slug);

  if (!tomb) return { title: '어? 묘비가 어디갔지?' };

  const name = tomb.user_name || '신원미상';
  const title = `${name}님, 여기에 잠들다`;
  const description = tomb.tomb_name?.trim() || '묘비에 꽃을 놓아주세요.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl(slug),
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PublicTombPage({ params }: Props) {
  const { slug } = await params;
  const tomb = await getPublishedTomb(slug);
  if (!tomb) notFound();

  const flowers = await getFlowers(tomb.user_id);

  return (
    <div className="home-container bg-real-black">
      <Header variant="public" />
      <main className="main-content text-center">
        <div className="username-container text-center text-xl">
          <span className="block">
            <span className="text-soul-green-500 font-bold underline">
              {tomb.user_name || '신원미상'}
            </span>
            <span className="text-white">님</span>
            <span className="block pt-1">여기에 잠들다</span>
          </span>
        </div>

        <DatesSection
          birthDate={tomb.birth_date}
          deathDate={tomb.death_date}
          editable={false}
        />
        <TombstoneSection tombName={tomb.tomb_name} placeholder="" />
        <FlowerSection
          tombSlug={tomb.slug}
          initialFlowers={flowers.recent}
          total={flowers.total}
        />
        <GroundSection />
        <DeathMaskSection deathmask={tomb.deathmask} editable={false} />

        {tomb.eulogy && (
          <section className="obituary-section">
            <div className="obituary-container">
              <p className="eulogy-body text-left">{tomb.eulogy}</p>
            </div>
            {tomb.eulogy_source && (
              <p className="eulogy-source">
                {sourceLabel(tomb.eulogy_source)}가 기억하는{' '}
                {tomb.user_name || '이 사람'}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function sourceLabel(source: string) {
  return (
    { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', other: '어떤 AI' }[
      source
    ] ?? '어떤 AI'
  );
}
