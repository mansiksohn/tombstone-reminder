# 묘비log

당신을 아는 존재에게 물어, 당신의 묘비를 세웁니다.

늘 쓰던 AI에게 *"이 핸드폰의 주인이 어떤 사람이었나요"* 를 묻고, 돌아온 답을
자신의 추도문으로 받아옵니다. 그중 한 문장을 골라 묘비에 새기고, 게시하고,
링크를 받은 사람이 찾아와 꽃을 둡니다.

주 흐름은 두 단계입니다. **랜딩**에서 질문을 복사해 가고, **만들기**에서 답을
붙여넣어 묘비를 세워 공유합니다. 로그인은 게시하는 순간에만 요구하고, 이름과
생일, 데스마스크는 묘비가 선 뒤에 꾸미는 선택 사항입니다.

이 앱은 LLM API를 직접 호출하지 않습니다. 그 사람을 아는 것은 그 사람이 늘
쓰던 AI뿐이고, 그 기억은 우리 서버에 없기 때문입니다. 질문을 복사해 가서
답을 받아오는 것까지가 사용자의 몫입니다.

## 스택

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind + Sass · Supabase · Vercel

## 시작하기

```bash
npm install
cp .env.example .env.local   # 값을 채운다
npm run dev
```

Supabase 프로젝트가 필요합니다. 아직 없다면
[`docs/SUPABASE-RECOVERY.md`](docs/SUPABASE-RECOVERY.md)를 따라 생성하고
`supabase/migrations/`의 마이그레이션을 적용하세요.

| 스크립트 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 타입 검사 |
| `npm run gen:types` | 스키마에서 TypeScript 타입 재생성 |

## 환경변수

| 이름 | 용도 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용.** 헌화 삽입·계정 삭제에만 사용 |
| `NEXT_PUBLIC_SITE_URL` | 공유 링크와 OG 태그의 절대 URL |

## 구조

```
src/
  app/
    page.tsx              랜딩 — 안내 + 프롬프트 복사 (로그인 불필요)
    new/                  묘비 만들기 — 붙여넣기 → 각인 → 게시
    auth/callback/        OAuth 코드 → 세션 교환
    me/                   내 묘비 — 이름·생일·데스마스크 꾸미기
    t/[slug]/             공개 묘비 (묘비별 OG 태그)
    share/[userId]/       구 링크 → 새 slug 리다이렉트
    api/flowers/          익명 헌화 (레이트리밋)
    api/account/          계정 삭제
  components/
  lib/
    supabase/             browser · server · service_role 클라이언트
    actions.ts            서버 액션 (모든 쓰기가 여기를 지난다)
    tomb.ts               조회
  styles/                 Sass partial + Tailwind
supabase/migrations/      스키마
docs/                     개편 계획, Supabase 이주 런북
```

## 문서

- [`docs/PLAN.md`](docs/PLAN.md) — 개편 계획과 진행 상황
- [`docs/SUPABASE-RECOVERY.md`](docs/SUPABASE-RECOVERY.md) — Supabase 이주 런북
