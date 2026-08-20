# 묘비log 개편 계획

> 작성일: 2026-08-20 / 브랜치: `claude/eulogy-generation-refactor-n7nob1`

## 0. 무엇이 바뀌는가

**기존**: 내가 내 묘비명을 직접 써서 꾸미는 개인 페이지. 꽃은 내 화면에서만 잠깐 피었다 사라짐.

**개편**: 내가 쓰던 LLM에게 "이 폰의 주인은 어떤 사람이었나요"를 묻고 → 그 답변을 내 추도문으로 받아와 → **게시**하고 → 링크를 받은 사람이 **찾아와 꽃을 두는** 추모 공간.

제품의 무게중심이 *꾸미기*에서 *받아오기 → 게시 → 헌화*로 이동한다. 이 세 단계가 하나의 루프로 닫히는 것이 이번 개편의 완료 조건이다.

### 확정된 방향
| 항목 | 결정 |
|---|---|
| 토대 | Next.js App Router로 이관 (같은 레포, 에셋·디자인 토큰·Supabase·Vercel 재사용) |
| 묘비명 | LLM 답변 전문 = 추도문. 사용자가 그중 **한 문장을 골라** 묘비에 각인 |
| 헌화 | 비로그인 익명 방문자도 가능 (서버 라우트 경유 + 레이트리밋) |
| 발견 경로 | 이번엔 링크 공유만. 공동묘지 인덱스는 후속 |
| 언어 | **TypeScript** |
| GOAT 섹션 | **폐기** |
| 온보딩 챗 | **3단계로 축소** 후 곧장 compose로 |
| Supabase | 일시정지 1년 초과 → **새 프로젝트로 이주.** [`SUPABASE-RECOVERY.md`](./SUPABASE-RECOVERY.md) |

---

## 1. 현재 상태 진단

### 살아있는 것
- `npm install` → `npm run build` **정상 통과**. 코드가 깨진 게 아니라 스택이 낡았다.
- `public/assets/**` — 묘비 SVG, 데스마스크 PNG 50종, 꽃 SVG 6종, Rive 향 애니메이션. **전부 그대로 재사용.**
- `src/styles/colors.scss` — soul-green 팔레트가 이 제품의 시각적 정체성. **유지.**
- Supabase `Tombs` 테이블 + Google OAuth + Vercel 프로젝트.

### 낡은 것
- `react-scripts` 5.0.1 — CRA는 유지보수 종료. 전이 의존성 취약점을 고칠 방법이 없다.
- `@supabase/auth-ui-react` — deprecated. 구글 버튼 하나 때문에 지고 있는 짐.
- 빌드 시 `caniuse-lite` outdated, babel-preset-react-app deprecation 경고.

### 실제 결함 (개편과 무관하게 고쳐야 함)
1. **`deleteAccount()`가 브라우저에서 `supabase.auth.admin.deleteUser()` 호출** — `src/utils/supabaseService.js:99`. admin API는 service_role 키를 요구하므로 이 호출은 **항상 실패한다.** 현재 "계정 삭제"는 Tombs 행만 지우고 auth 계정은 남긴 채 로그아웃시킨다. 서버 라우트로 옮겨야 한다.
2. **한 행을 읽는 데 네트워크 왕복 7회** — `fetchIsOnboarded / fetchUserName / fetchTombstoneName / fetchBirthDate / fetchDeathDate / fetchObituary / fetchGoat`가 각각 같은 행을 `.single()`로 조회한다. `select('*')` 한 번이면 된다. `handleOnboardingComplete()`는 이걸 **순차로** 6번 더 돈다.
3. **서비스 레이어 우회** — `ObituarySection.js`가 `supabase.from('Tombs').update()`를 직접 호출한다. `OnboardingChat.js`의 deathmask 저장도 마찬가지. 저장 경로가 두 갈래라 상태가 어긋난다.
4. **`createShareLink()`가 무의미한 쿼리를 던진다** — `tomb_name`을 select해놓고 쓰지 않고 (`data` 미사용 eslint 경고), 반환값은 `${origin}/share/${userId}` 문자열 조합일 뿐이다.
5. **공개 URL에 auth user UUID가 그대로 노출** — `/share/{user_id}`. 인증 주체 식별자를 공개 링크에 박는 건 피해야 한다.
6. **꽃이 저장되지 않는다** — `FlowerSection.js`는 순수 `useState`. 10초 뒤 사라지고 서버에 아무것도 남지 않는다. 위치도 `Math.random()`이라 리로드마다 튄다. 개편의 핵심이 여기다.
7. `dangerouslySetInnerHTML`로 묘비명 렌더 (`TombstoneSection.js:52`) — 지금은 본인 입력이라 위험이 낮지만, LLM 붙여넣기 + 공개 게시로 바뀌면 반드시 제거해야 한다.

---

## 2. 목표 아키텍처

### 라우트 맵
```
app/
  layout.tsx                      공통 셸 (폰트, 배경, Analytics)
  page.tsx                        랜딩 / 로그인 (로그인 시 /me로)
  auth/callback/route.ts          Supabase PKCE 코드 교환
  me/page.tsx                     내 묘비 — 상태(초안/게시) 관리, 공유 링크
  me/compose/page.tsx             ★ 프롬프트 복사 → 붙여넣기 → 한 줄 각인 → 미리보기 → 게시
  t/[slug]/page.tsx               공개 묘비 (서버 렌더 + generateMetadata)
  t/[slug]/opengraph-image.tsx    동적 OG 이미지
  share/[userId]/page.tsx         구 링크 → 새 slug로 301 리다이렉트
  api/flowers/route.ts            익명 헌화 POST
  api/account/route.ts            계정 삭제 (service_role)
```

`/share/:userId` → `/t/:slug` 전환. **이미 밖에 뿌려진 링크가 404가 되면 안 되므로 리다이렉트 라우트는 필수.**

### 기술 선택
- **Next.js 15 App Router + React 19**, Vercel 배포 (기존 프로젝트 그대로).
- **Tailwind 3 유지.** SCSS 파일이 스타일의 본체이고 Tailwind 4는 Sass와 궁합이 나쁘다. CRA→Next 이관과 Tailwind 3→4를 동시에 하는 건 위험을 두 배로 지는 일 — 후속으로 미룬다.
- **`@supabase/ssr`** 도입. `@supabase/auth-helpers`는 deprecated이고, 서버 컴포넌트에서 쿠키 기반 세션을 읽으려면 이게 필요하다.
- **`@supabase/auth-ui-react` 제거** → `signInWithOAuth` 직접 호출하는 구글 버튼 하나로 대체.
- **TypeScript 확정.** `supabase gen types typescript`로 스키마에서 타입을 생성해 쓴다. 컬럼명 오타나 nullable 누락을 컴파일 타임에 잡는다 — 스키마를 새로 짜는 이번 이주와 특히 궁합이 좋다.

### 스키마

Supabase를 새 프로젝트로 이주하므로 **기존 테이블에 ALTER를 거는 게 아니라 처음부터 새로 짓는다.** `supabase/migrations/`에 마이그레이션으로 관리.

```sql
create table tombs (                          -- 대문자 "Tombs" → 소문자. 따옴표 지옥 탈출
  user_id             uuid primary key references auth.users(id) on delete cascade,
  slug                text unique not null,   -- 공개 URL용. auth UUID 노출 안 함
  status              text not null default 'draft',   -- draft | published
  user_name           text,
  tomb_name           text,                   -- 추도문에서 골라 각인한 한 문장
  eulogy              text,                   -- LLM 답변 전문
  eulogy_source       text,                   -- 'chatgpt' | 'claude' | 'gemini' | 'other'
  eulogy_captured_at  timestamptz,
  deathmask           text,
  birth_date          date,
  death_date          date,
  is_onboarded        boolean not null default false,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table flowers (
  id           uuid primary key default gen_random_uuid(),
  tomb_id      uuid not null references tombs(user_id) on delete cascade,
  flower_type  text not null,          -- Rose | Tulip | Blossom | Bouquet | Hibiscus | Sunflower
  visitor_hash text,                   -- IP+UA 해시. 레이트리밋용 (원문 미저장)
  created_at   timestamptz not null default now()
);
create index flowers_tomb_created_idx on flowers (tomb_id, created_at desc);
```

구 스키마 대비 달라지는 것:
- **`goat` 컬럼 없음** — 폐기 확정. 단 레거시 추출 CSV에는 남겨둔다 (버리는 건 나중에도 되지만 되살리는 건 못 한다).
- **`obituary`(160자) 없음** — `eulogy`가 역할을 대체한다. 레거시 `obituary` 값은 이주 시 `eulogy`로 옮긴다.
- `tomb_name`은 이름을 유지하되 의미가 바뀐다: "직접 쓴 한 줄" → "추도문에서 골라 각인한 한 문장".

### RLS 정책
새 프로젝트에 처음부터 제대로 건다. (구 프로젝트의 정책은 로컬 복원본에서 확인만 하고 참고하지 않는다 — 익명 share 페이지가 읽고 있었으므로 사실상 열려 있었을 가능성이 높다.)

목표 상태:
- `tombs` SELECT: 익명은 `status = 'published'` 행만. 본인은 `auth.uid() = user_id`로 전체.
- `tombs` INSERT/UPDATE: `auth.uid() = user_id`만.
- `flowers` SELECT: 게시된 묘비의 것만 익명 허용.
- `flowers` INSERT: **RLS로 전부 차단.** 삽입은 `/api/flowers` 서버 라우트에서 service_role로만. 익명 INSERT를 클라이언트에 열어주면 스팸 방어 지점이 사라진다.
- `legacy_tombs`(이주용): **SELECT/INSERT/UPDATE 전부 차단.** 이메일이 든 테이블이므로 anon 키로는 한 줄도 읽히면 안 된다. 서버에서 service_role로만.

레이트리밋은 Upstash 같은 외부 의존성 없이 — 삽입 직전 같은 `visitor_hash`의 최근 1분 건수를 세는 쿼리 하나로 충분하다.

---

## 3. 온보딩 축소 (5단계 → 3단계)

첫 경험의 클라이맥스가 챗이 아니라 compose로 옮겨간다. 챗에서는 묘비를 세우는 데 꼭 필요한 것만 묻고 빠진다.

| 단계 | 현재 | 개편 후 |
|---|---|---|
| 0 | 이름 (12자) | **유지** |
| 1 | 묘비명 (72자) | **제거** — compose에서 LLM 답변 중 한 문장을 골라 각인 |
| 2 | 생년월일 | **유지** |
| 3 | 데스마스크 (묻어둘 것) | **유지** — 50종 자산이 아깝고, 고르는 행위 자체가 좋다 |
| 4 | "다 만들었습니다" → 홈 | **compose로 직행** |

마지막 단계의 문구도 바뀐다. 지금은 "이제 다 만들었습니다"인데, 개편 후에는 여기가 끝이 아니라 **시작**이다. 묘비는 비어 있고, 이제 그걸 채우러 자기 AI에게 물으러 간다.

## 4. 핵심 신규 화면: `/me/compose`

이 제품의 새 심장. 흐름:

1. **안내** — "당신을 아는 존재는 당신의 AI뿐입니다."
2. **프롬프트 제시** — 아래 원문을 상수로 고정, [복사] 버튼 + ChatGPT/Claude/Gemini 딥링크.
   > 이 핸드폰의 주인이 이미 세상을 떠났다고 가정해주세요. 그리고 저는 이 핸드폰을 주운 사람입니다. 예전에 이 핸드폰을 사용하던 사람이 어떤 사람이었는지 알고 싶어요. 그 사람을 알고 있는 존재는 당신뿐입니다. 당신이라면, 그 사람에 대해 무엇을 이야기 해주시겠어요?
3. **붙여넣기** — 돌아와서 답변을 textarea에 붙여넣는다. 어느 LLM에서 받았는지 선택(표시용).
4. **한 문장 각인** — 붙여넣은 글을 문장 단위로 쪼개 카드로 보여주고, 탭해서 하나를 고르면 그게 묘비명이 된다. (직접 다듬기도 허용)
5. **미리보기 → 게시** — 실제 공개 묘비 그대로 렌더해서 보여주고 [게시하기].
6. **게시 완료** — 공유 링크 + OG 카드 미리보기.

### 반드시 넣어야 할 안전장치
LLM 답변에는 **실명·직장·지역·인간관계 같은 식별 정보가 섞여 나올 수 있다.** 그리고 이 제품은 그걸 **공개 게시**한다. 따라서:
- 게시 **전** 전문 편집이 가능해야 한다 (붙여넣은 그대로 강제 게시 금지).
- "이 내용은 링크를 가진 누구나 볼 수 있습니다"를 게시 버튼 옆에 명시.
- `dangerouslySetInnerHTML` 제거하고 줄바꿈은 `white-space: pre-wrap`으로 처리.
- 게시 후 언제든 비공개 전환 가능 (`status`를 draft로).

---

## 5. 헌화 인터랙션 개편

| | 현재 | 개편 후 |
|---|---|---|
| 저장 | 안 함 (useState) | `flowers` 테이블 |
| 수명 | 10초 뒤 소멸 | 영속 |
| 위치 | `Math.random()`, 리로드마다 이동 | `id` 해시 기반 **결정론적 배치** — 다시 와도 그 자리 |
| 누가 | 본인 화면에서만 | 링크 받은 익명 방문자 |

- 땅 위에는 **최근 N송이(약 60)만** 렌더하고, 전체는 "○○송이의 꽃이 놓였습니다" 카운터로 표시. 무한히 쌓이면 화면이 무너진다.
- 헌화 직후 애니메이션은 유지하되 fade-out 타이머는 제거.
- 같은 방문자의 연타는 억제하되 완전 차단은 하지 않는다 (여러 송이 두는 건 자연스러운 행동).

---

## 6. 서버 되살리기

**Supabase 프로젝트가 일시정지 상태이고 1년이 넘어 대시보드 복원이 막혔습니다.** 이것이 사이트가 죽어 있는 원인입니다. 코드 문제가 아닙니다.

→ 전체 절차는 **[`SUPABASE-RECOVERY.md`](./SUPABASE-RECOVERY.md)** 참조.

가장 급한 두 가지만 여기 옮기면:

1. **백업을 오늘 다운로드하세요.** 1년 넘게 정지된 프로젝트이고, 이 파일이 사라지면 복구 불가능합니다.
2. **백업에 `auth` 스키마가 들어있는지 확인하세요.** `tombs`에는 이메일 컬럼이 없어서, 묘비와 사람을 잇는 유일한 끈이 `user_id` → `auth.users`입니다. 이게 없으면 남는 건 주인을 알 수 없는 묘비 더미입니다.

그 외 나머지 확인 항목:
- Vercel 프로젝트·도메인이 아직 살아있는지, `tombstone.vercel.app`을 계속 쓸지
- 환경변수 전면 교체 — `REACT_APP_*` → `NEXT_PUBLIC_*`, 신규 `SUPABASE_SERVICE_ROLE_KEY`
- Google OAuth 리디렉션 URI를 새 프로젝트 ref로 추가
- **keep-alive 워크플로 활성화** — 아무것도 안 하면 7일 비활성으로 똑같이 반복됩니다

## 7. 단계별 실행

각 단계는 독립 커밋. 앞 단계가 초록불이어야 다음으로 간다.

| Phase | 내용 | 산출물 |
|---|---|---|
| **0** | **Supabase 이주** — 백업 확보, 로컬 복원·실태 파악, 새 프로젝트, OAuth 재연결, keep-alive | 살아있는 DB |
| **1** | Next.js + TypeScript 이관 — 화면·기능 동등, 토대만 교체. `@supabase/ssr` 도입, auth-ui 제거, 에셋/SCSS 이식 | 동작하는 Next 앱 |
| **2** | 데이터 레이어 — 새 스키마 마이그레이션 + RLS, 타입 생성, fetch 7종을 `getTomb()` 하나로, 저장 경로 단일화, `deleteAccount` 서버 라우트 이전 | 왕복 7회 → 1회 |
| **3** | GOAT 폐기 + 온보딩 3단계 축소 | 코드·컬럼·SCSS 제거 |
| **4** | ★ `/me/compose` — 프롬프트 복사, 붙여넣기, 문장 선택 각인, 미리보기, 게시 | 새 온보딩 루프 |
| **5** | 공유 — slug URL, `generateMetadata`, 동적 OG 이미지, 구 링크 리다이렉트 | 카톡/트위터에 묘비 카드 |
| **6** | ★ 헌화 영속화 — `flowers` 테이블, `/api/flowers`, 결정론적 배치, 카운터 | 찾아와 꽃을 두는 루프 완성 |
| **7** | 레거시 클레임 (사용자 수가 값어치를 하면), README 재작성, 정리 | |

**Phase 0이 나머지 전부를 막고 있습니다.** DB 없이는 1단계 이후를 검증할 방법이 없습니다.

## 8. 남은 결정

- **레거시 클레임 플로우를 구현할지** — 백업을 로컬 복원해 실제 사용자 수를 본 뒤에 판단. 20명대면 CSV 보관만 하고 넘어가는 게 맞습니다.
- **`tombstone.vercel.app` 도메인 유지 여부.**
- **데스마스크 50종 유지** — 유지 쪽으로 기울어 있음. 온보딩 3단계 중 하나로 남습니다.

### 이번에 확정된 것
TypeScript 채택 / GOAT 폐기 / 온보딩 3단계 / Next.js App Router / 익명 헌화 / 링크 공유만 (공동묘지 후속) / Supabase 새 프로젝트 이주
