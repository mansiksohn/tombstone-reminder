import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { FLOWER_TYPES } from '@/lib/flowers';
import type { FlowerType } from '@/lib/database.types';

/** 같은 방문자가 1분 안에 놓을 수 있는 최대 송이. */
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

/**
 * 방문자 식별용 해시. IP 원문은 저장하지 않는다.
 * 정확한 식별이 목적이 아니라 연타를 눌러 막는 것이 목적이다.
 * User-Agent는 요청마다 클라이언트가 자유롭게 바꿀 수 있어 식별자에 넣지 않는다
 * (넣으면 헤더만 바꿔가며 한도를 무한정 우회할 수 있다).
 */
function visitorHash(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createHash('sha256').update(`${ip}|${salt}`).digest('hex');
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

  // 카운트 조회와 삽입을 DB 함수 안에서 advisory lock으로 직렬화해
  // 동시 요청이 레이트리밋을 우회하지 못하게 한다 (TOCTOU 방지).
  const { data, error } = await admin
    .rpc('insert_flower_rate_limited', {
      p_tomb_id: tomb.user_id,
      p_flower_type: flowerType,
      p_visitor_hash: hash,
      p_rate_limit: RATE_LIMIT,
      p_window_seconds: RATE_WINDOW_MS / 1000,
    })
    .single();

  if (error) {
    console.error('헌화 삽입 실패:', error.message);
    return NextResponse.json({ error: '꽃을 놓지 못했습니다.' }, { status: 500 });
  }

  if (!data.inserted) {
    // 한도 도달은 오류가 아니라 정상적인 결과다. 4xx로 돌려주면 브라우저가
    // 콘솔에 "Failed to load resource"를 자동으로 찍는데, 이건 JS로 막을
    // 방법이 없다 — 애초에 오류 상태코드를 쓰지 않는 수밖에 없다.
    return NextResponse.json({
      limited: true,
      retryAfterSeconds: data.retry_after_seconds,
    });
  }

  return NextResponse.json({ id: data.flower_id });
}
