import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { FLOWER_TYPES } from '@/lib/flowers';
import type { FlowerType } from '@/lib/database.types';

/** 같은 방문자가 1분 안에 놓을 수 있는 최대 송이. */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

/**
 * 방문자 식별용 해시. IP와 UA 원문은 저장하지 않는다.
 * 정확한 식별이 목적이 아니라 연타를 눌러 막는 것이 목적이다.
 */
function visitorHash(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const ua = request.headers.get('user-agent') ?? 'unknown';
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createHash('sha256').update(`${ip}|${ua}|${salt}`).digest('hex');
}

export async function POST(request: NextRequest) {
  let body: { slug?: string; flowerType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const { slug, flowerType } = body;
  if (!slug || !flowerType) {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
  if (!FLOWER_TYPES.includes(flowerType as FlowerType)) {
    return NextResponse.json({ error: '알 수 없는 꽃입니다.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // 게시된 묘비에만 헌화할 수 있다. slug로만 받으므로 남의 user_id를 알 필요가 없다.
  const { data: tomb } = await admin
    .from('tombs')
    .select('user_id')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!tomb) {
    return NextResponse.json({ error: '묘비를 찾을 수 없습니다.' }, { status: 404 });
  }

  const hash = visitorHash(request);
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();

  const { count } = await admin
    .from('flowers')
    .select('*', { count: 'exact', head: true })
    .eq('visitor_hash', hash)
    .gte('created_at', since);

  if ((count ?? 0) >= RATE_LIMIT) {
    // 창이 꽉 찬 것은 슬라이딩 윈도우라, 언제 풀리는지는 그 안에서 가장
    // 오래된 한 송이가 창 밖으로 밀려나는 시점이다 — 그게 다시 놓을 수
    // 있게 되는 때다.
    const { data: oldest } = await admin
      .from('flowers')
      .select('created_at')
      .eq('visitor_hash', hash)
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const retryAfterMs = oldest
      ? new Date(oldest.created_at).getTime() + RATE_WINDOW_MS - Date.now()
      : RATE_WINDOW_MS;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    // 한도 도달은 오류가 아니라 정상적인 결과다. 4xx로 돌려주면 브라우저가
    // 콘솔에 "Failed to load resource"를 자동으로 찍는데, 이건 JS로 막을
    // 방법이 없다 — 애초에 오류 상태코드를 쓰지 않는 수밖에 없다.
    return NextResponse.json({ limited: true, retryAfterSeconds });
  }

  const { data, error } = await admin
    .from('flowers')
    .insert({
      tomb_id: tomb.user_id,
      flower_type: flowerType as FlowerType,
      visitor_hash: hash,
    })
    .select('id')
    .single();

  if (error) {
    console.error('헌화 삽입 실패:', error.message);
    return NextResponse.json({ error: '꽃을 놓지 못했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
