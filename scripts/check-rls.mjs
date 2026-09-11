/**
 * RLS가 살아 있는지 실제 DB에 대고 확인한다.
 *
 * `npm run e2e`는 스텁 위에서 돈다. 스텁에는 정책이 없어서, 초안이 남에게
 * 보이는지는 영원히 알 수 없다 (e2e/README.md 참조). 이 검사가 그 자리를
 * 메운다 — 앱을 통째로 건너뛰고 anon 키로 PostgREST를 직접 부른다.
 *
 * 앱을 건너뛰는 것이 핵심이다. 페이지도 OG 이미지도 헌화 API도 쿼리에
 * status='published'를 직접 붙이므로, RLS가 통째로 꺼져 있어도 화면에서는
 * 아무 이상이 없다. 반면 anon 키는 브라우저 번들에 구워져 나가기 때문에
 * 누구나 꺼내서 이렇게 직접 부를 수 있다. 실제 공격면은 여기다.
 *
 * 구 프로젝트에는 `FOR SELECT USING (true)`가 걸려 있어 anon 키만으로
 * 전원의 묘비명과 부고가 읽혔다. 스키마를 다시 적용하거나 프로젝트를
 * 옮길 때마다 이걸 한 번씩 돌리면 그 사고가 되풀이되지 않는다.
 *
 *   npm run check-rls
 *   npm run check-rls -- <url> <anon-key>
 *
 * 환경변수 NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY로도 받는다.
 */

const [argUrl, argKey] = process.argv.slice(2);
const url = (argUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const key = argKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !key) {
  console.error(`값 두 개가 필요합니다 — Supabase 대시보드의 Project Settings → API.

  npm run check-rls -- https://xxxx.supabase.co <anon 키>

또는 NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY로 넣으세요.

anon(=publishable) 키를 쓸 것. service_role(=secret) 키는 RLS를 통째로
무시하므로, 정책이 멀쩡해도 전부 읽혀 실패로 보입니다.`);
  process.exit(2);
}

/** anon 역할로 부른다 — Authorization을 붙이지 않는 것이 요점이다. */
async function asAnon(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key } });
  const body = await res.json().catch(() => null);

  // 정책이 아예 막아버린 경우다. 과하게 닫힌 것일 뿐 새지는 않는다.
  if (!res.ok) return { denied: true, status: res.status, body };
  if (!Array.isArray(body)) return { denied: true, status: res.status, body };
  return { rows: body };
}

const problems = [];
const notes = [];

console.log(`${url} 에 anon 키로 직접 묻습니다.\n`);

// ── 묘비 ────────────────────────────────────────────────────────────────
const tombs = await asAnon('tombs?select=slug,status');

if (tombs.denied) {
  console.log(`묘비   전부 거부됨 (HTTP ${tombs.status}) — 새지 않습니다.`);
} else {
  const leaked = tombs.rows.filter((t) => t.status !== 'published');
  const published = tombs.rows.filter((t) => t.status === 'published');

  console.log(`묘비   ${tombs.rows.length}행 (게시 ${published.length} · 그 외 ${leaked.length})`);

  if (leaked.length > 0) {
    problems.push(
      `게시되지 않은 묘비 ${leaked.length}개가 anon 키로 읽힙니다: ` +
      leaked.map((t) => `${t.slug}(${t.status})`).join(', '),
    );
  }

  // 여기서 멈추면 안 된다. 빈 테이블을 조회해도 "초안 0개"가 나온다.
  // 게시된 묘비가 한 줄도 안 나왔다면 쿼리가 헛돌았을 수 있으므로
  // 통과라고 말하지 않는다.
  if (published.length === 0) {
    notes.push(
      '게시된 묘비가 한 줄도 오지 않았습니다. 이 결과는 "초안이 가려졌다"와\n' +
      '    "볼 것이 원래 없었다"를 구분하지 못합니다. 묘비 하나를 게시해두고\n' +
      '    다시 돌리세요 — 그 한 줄이 나와야 나머지가 의미를 갖습니다.',
    );
  }
}

// ── 헌화 ────────────────────────────────────────────────────────────────
// flowers.tomb_id는 tombs.user_id를 가리킨다. 게시된 묘비의 꽃만 보여야 한다.
const flowers = await asAnon('flowers?select=tomb_id');

if (flowers.denied) {
  console.log(`헌화   전부 거부됨 (HTTP ${flowers.status}) — 새지 않습니다.`);
} else {
  console.log(`헌화   ${flowers.rows.length}행`);

  const owners = await asAnon('tombs?select=user_id&status=eq.published');
  if (!owners.denied) {
    const visible = new Set(owners.rows.map((t) => t.user_id));
    const orphans = flowers.rows.filter((f) => !visible.has(f.tomb_id));
    if (orphans.length > 0) {
      problems.push(
        `게시되지 않은 묘비의 헌화 ${orphans.length}송이가 anon 키로 읽힙니다.`,
      );
    }
  }
}

// ── 결과 ────────────────────────────────────────────────────────────────
console.log();

if (problems.length > 0) {
  console.error('실패 — RLS가 지금 DB에 걸려 있지 않습니다.\n');
  problems.forEach((p) => console.error('  ! ' + p));
  console.error('\nsupabase/migrations/20260820000000_init.sql의 정책이 적용됐는지 확인하세요.');
  process.exit(1);
}

if (notes.length > 0) {
  console.error('판단 보류 — 실패는 아니지만 통과라고도 못 합니다.\n');
  notes.forEach((n) => console.error('  · ' + n));
  process.exit(2);
}

console.log('통과 — anon 키로는 게시된 것만 읽힙니다.');
