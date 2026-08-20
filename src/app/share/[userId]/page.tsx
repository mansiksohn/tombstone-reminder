import { permanentRedirect, notFound } from 'next/navigation';
import { getSlugByUserId } from '@/lib/tomb';

export const dynamic = 'force-dynamic';

/**
 * 구 공유 링크 `/share/{user_id}` 를 새 `/t/{slug}` 로 잇는다.
 * 이미 밖에 뿌려진 링크가 404가 되면 안 된다.
 */
export default async function LegacyShareRedirect({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const slug = await getSlugByUserId(userId);
  if (!slug) notFound();

  permanentRedirect(`/t/${slug}`);
}
