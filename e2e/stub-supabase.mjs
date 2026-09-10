/**
 * Supabase를 아주 얕게 흉내내는 인메모리 스텁.
 *
 * 진짜 Supabase를 붙이면 로그인 화면을 로컬에서 열어볼 수 없다. 구글
 * OAuth를 자동으로 통과할 방법이 없기 때문이다. 그래서 로그인 뒤에만
 * 보이는 것들 — 내 묘비, 각인 수정, 게시 — 은 오랫동안 프리뷰에 올려
 * 손으로 눌러보는 수밖에 없었다.
 *
 * 이 스텁은 GoTrue의 /auth/v1/user와 PostgREST의 tombs·flowers만
 * 흉내낸다. 세션 쿠키를 브라우저에 심어주면 앱은 로그인한 것으로 본다.
 *
 * 흉내내지 않는 것 (여기서 통과해도 확인된 것이 아니다):
 * - RLS. 초안이 남에게 안 보이는지는 여기서 알 수 없다.
 * - DB 제약(길이, published에 각인 필요 등)과 slug 생성 트리거.
 * - 진짜 OAuth 코드 교환.
 */
import http from 'node:http';
import { randomUUID } from 'node:crypto';

const USER_ID = '11111111-1111-1111-1111-111111111111';

const USER = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'e2e@example.com',
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { full_name: '테스트' },
  created_at: '2026-01-01T00:00:00Z',
};

/** 브라우저에 심을 세션 쿠키 값. @supabase/ssr이 읽는 형식이다. */
function sessionCookie() {
  const session = {
    access_token: 'stub-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: 4102444800,
    refresh_token: 'stub-refresh-token',
    user: USER,
  };
  return 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
}

/**
 * 쿠키 이름은 supabase-js가 URL에서 만든다 — 호스트의 첫 마디 + 접미사.
 * http://127.0.0.1:PORT 로 붙으므로 'sb-127-auth-token'이 된다.
 */
const COOKIE_NAME = 'sb-127-auth-token';

/** 가입 트리거가 만들어주는 것과 같은 초기 상태. */
function emptyTomb() {
  return {
    user_id: USER_ID,
    slug: 'e2etest001',
    status: 'draft',
    user_name: null,
    tomb_name: null,
    deathmask: null,
    birth_date: null,
    death_date: null,
    eulogy: null,
    eulogy_source: null,
    eulogy_captured_at: null,
    published_at: null,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  };
}

function start(port) {
  let tomb = emptyTomb();
  let flowers = [];

  const filter = (url, field) => {
    const match = url.match(new RegExp(`${field}=eq\\.([^&]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const json = (res, body, headers = {}) => {
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify(body));
  };

  // maybeSingle()이 기대하는 단일 객체 응답.
  const single = (res, body) => {
    res.writeHead(200, { 'Content-Type': 'application/vnd.pgrst.object+json' });
    res.end(JSON.stringify(body));
  };

  const readBody = (req) =>
    new Promise((resolve) => {
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          resolve(null);
        }
      });
    });

  const server = http.createServer(async (req, res) => {
    const path = req.url.split('?')[0];

    // 검사에서 DB 상태를 직접 들여다보기 위한 창구.
    if (path === '/__state') return json(res, { tomb, flowers });
    if (path === '/__reset') {
      tomb = emptyTomb();
      flowers = [];
      return json(res, { ok: true });
    }

    if (path === '/auth/v1/user') return json(res, USER);

    if (path.startsWith('/rest/v1/tombs')) {
      if (req.method === 'PATCH') {
        Object.assign(tomb, (await readBody(req)) ?? {});
        tomb.updated_at = new Date().toISOString();
        res.writeHead(204);
        return res.end();
      }

      // 필터를 만족하지 못하면 없는 것으로 답한다 (maybeSingle → null).
      const wanted = {
        slug: filter(req.url, 'slug'),
        user_id: filter(req.url, 'user_id'),
        status: filter(req.url, 'status'),
      };
      const miss = Object.entries(wanted).some(
        ([key, value]) => value !== null && value !== tomb[key],
      );
      return miss ? json(res, []) : single(res, tomb);
    }

    if (path.startsWith('/rest/v1/flowers')) {
      if (req.method === 'POST') {
        const body = (await readBody(req)) ?? {};
        const rows = (Array.isArray(body) ? body : [body]).map((row) => ({
          id: randomUUID(),
          created_at: new Date().toISOString(),
          ...row,
        }));
        flowers.push(...rows);
        return single(res, { id: rows[0].id });
      }

      const tombId = filter(req.url, 'tomb_id');
      const visitor = filter(req.url, 'visitor_hash');
      let rows = flowers;
      if (tombId) rows = rows.filter((f) => f.tomb_id === tombId);
      if (visitor) rows = rows.filter((f) => f.visitor_hash === visitor);

      // count: 'exact'는 Content-Range로 총 개수를 받는다.
      const range = `0-${Math.max(rows.length - 1, 0)}/${rows.length}`;
      if (req.method === 'HEAD') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Range': range,
        });
        return res.end();
      }
      return json(
        res,
        rows.map(({ id, flower_type }) => ({ id, flower_type })),
        { 'Content-Range': range },
      );
    }

    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'no session' }));
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

export { start, sessionCookie, COOKIE_NAME, USER_ID };
