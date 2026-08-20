# Supabase 이주 런북

> 상황: `tombstone-reminder` 프로젝트가 2025-04-25부터 일시정지. 1년 초과로 **대시보드 복원 경로가 닫힘.**
> 데이터는 살아있고 백업 다운로드만 가능.

## 결론부터

**복구가 아니라 이주입니다.** 새 프로젝트를 만드는 것 외에 선택지가 없고, 그렇다면 **구 덤프를 새 프로젝트에 통째로 붓지 마세요.** 어차피 스키마를 바꿔야 하기 때문입니다 — GOAT 컬럼 폐기, `slug`/`status`/`eulogy` 추가, `flowers` 테이블 신설, RLS 전면 재작성. 낡은 스키마를 복원해놓고 그 위에서 ALTER를 돌리는 것보다, **스키마는 마이그레이션으로 새로 짓고 데이터만 옮기는 편이** 결과물이 깨끗하고 실패 지점도 적습니다.

덤으로 이 이주는 지금까지 미뤄온 것들을 한 번에 정리할 기회입니다: 따옴표가 필요한 `"Tombs"` 대문자 테이블명, `user_id`를 키로 쓰는 구조, 열려 있는 RLS.

---

## ⚠️ 지금 당장 (다른 무엇보다 먼저)

### 1. 백업을 다운로드하세요

1년 넘게 정지된 프로젝트입니다. Supabase가 백업을 영구 보관한다는 보장은 없고, 이 파일이 사라지면 **복구 불가능합니다.** 오늘 받으세요.

- 대시보드 → 해당 프로젝트 → Download backup
- 받은 파일을 클라우드 드라이브 등 **두 군데 이상**에 보관. `~/Downloads`에만 두지 마세요.
- 파일명·크기·형식을 기록해두세요 (보통 `db_cluster-<날짜>-<ref>.backup` 또는 `.sql.gz`).

### 2. `auth` 스키마가 들어있는지 확인하세요 — 이게 이주 전체의 분기점

**`Tombs` 테이블에는 이메일 컬럼이 없습니다.** 묘비와 사람을 잇는 유일한 끈은 `user_id` → `auth.users`입니다.

- **`auth.users`가 백업에 있으면** → `user_id`로 이메일을 얻어낼 수 있고, 기존 사용자에게 묘비를 돌려줄 수 있습니다.
- **없으면** → 남는 건 주인을 알 수 없는 묘비명·부고 더미입니다. 내용은 읽히지만 누구 것인지 영원히 알 수 없습니다.

```bash
# custom format (.backup) 인 경우
pg_restore --list db_cluster-*.backup | grep -i " auth "

# plain SQL (.sql / .sql.gz) 인 경우
zcat backup.sql.gz | grep -m5 -n "COPY auth.users"
```

결과를 확인한 뒤 아래로 진행하세요.

---

## 3. 로컬에 복원해서 실물 확인

새 프로젝트를 만들기 **전에** 백업 안에 실제로 뭐가 있는지 봅니다.

```bash
docker run -d --name tombstone-restore \
  -e POSTGRES_PASSWORD=pw -p 55432:5432 postgres:15

# custom format
pg_restore -d "postgresql://postgres:pw@localhost:55432/postgres" \
  --no-owner --no-acl db_cluster-*.backup

# plain SQL 이면
# zcat backup.sql.gz | psql "postgresql://postgres:pw@localhost:55432/postgres"
```

`--no-owner --no-acl`은 필수입니다. 덤프에 든 Supabase 전용 롤(`supabase_admin` 등)이 로컬에 없어서 그대로 복원하면 실패합니다. 다른 에러는 대부분 무시해도 됩니다 — `Tombs`와 `auth.users` 두 개만 살아나면 목적 달성입니다.

### 확인 쿼리

```sql
select count(*) as 전체묘비 from "Tombs";
select count(*) as 온보딩완료 from "Tombs" where is_onboarded;
select count(*) as 묘비명있음 from "Tombs" where tomb_name is not null and tomb_name <> '';
select count(*) as 계정수 from auth.users;

-- 실제 컬럼 목록 (마이그레이션 SQL 확정에 필요)
select column_name, data_type from information_schema.columns
where table_name = 'Tombs' order by ordinal_position;

-- RLS 정책 (기존에 뭘 걸어놨는지)
select tablename, policyname, cmd, qual from pg_policies where schemaname = 'public';
```

**여기서 나오는 "온보딩완료" 숫자가 이후 모든 판단을 좌우합니다.**

- **0~20명대** → 클레임 플로우를 코드로 만들 가치가 없습니다. CSV로 뽑아두고, 나중에 연락 오면 수동 처리. 그냥 새로 시작하세요.
- **수백 명 이상** → 아래 §6 클레임 플로우를 구현할 가치가 있습니다.

### 레거시 데이터 추출

```sql
copy (
  select u.email, u.created_at as 가입일,
         t.user_name, t.tomb_name, t.obituary, t.deathmask,
         t.birth_date, t.death_date, t.goat, t.is_onboarded
  from "Tombs" t
  join auth.users u on u.id = t.user_id
) to '/tmp/legacy_tombs.csv' with csv header;
```

`goat`은 폐기하기로 했지만 **추출에는 포함하세요.** 버리는 건 언제든 할 수 있지만 되살리는 건 못 합니다. 보험료가 0원입니다.

> 이 CSV에는 이메일과 개인이 쓴 부고가 들어갑니다. 레포에 커밋하지 말고 로컬·비공개 보관하세요.

---

## 4. 새 프로젝트 생성

- **리전은 기존과 동일하게** (한국 사용자 대상이면 `ap-northeast-2` 서울).
- 이름은 `tombstone` 등으로 새로. 구 프로젝트는 **당장 삭제하지 마세요** — 백업이 확실히 손에 들어오고 이주가 끝날 때까지 그대로 둡니다.
- 새로 확보할 값: Project URL, `anon` key, `service_role` key.

### 바뀌는 것 전부

| 항목 | 조치 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 새 프로젝트 URL로 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 새 anon key로 |
| `SUPABASE_SERVICE_ROLE_KEY` | **신규** — 헌화 삽입·계정 삭제용 서버 전용 |
| Google Cloud Console OAuth | 승인된 리디렉션 URI에 `https://<새ref>.supabase.co/auth/v1/callback` 추가 |
| Supabase Auth → URL Configuration | Site URL과 Redirect Allowlist에 `https://tombstone.vercel.app/auth/callback` 및 `http://localhost:3000/auth/callback` |
| Vercel | 위 환경변수 3개 갱신 (Production/Preview/Development 전부) |

구 프로젝트의 리디렉션 URI는 Google Console에서 **지우지 말고 남겨두세요.** 롤백 여지를 없앨 이유가 없습니다.

---

## 5. 스키마는 마이그레이션으로 새로

구 덤프를 복원하는 대신 `supabase/migrations/`에 새로 작성합니다. 개편 후 목표 형태는 `docs/PLAN.md` §2 참조. 요점:

- `Tombs` → 소문자 `tombs`로 정리 (따옴표 지옥 탈출). 코드를 어차피 전부 새로 쓰므로 지금이 유일한 기회입니다.
- `goat` 컬럼 없음 (폐기 확정)
- `slug`, `status`, `eulogy`, `eulogy_source`, `eulogy_captured_at`, `published_at` 추가
- `flowers` 테이블 신설
- RLS를 처음부터 제대로: 익명은 `status='published'` 행만 읽기, 쓰기는 본인만, `flowers` INSERT는 RLS로 차단하고 서버 라우트에서 service_role로만

TypeScript 타입은 `supabase gen types typescript` 로 스키마에서 생성해 씁니다.

---

## 6. 기존 사용자에게 묘비 돌려주기 (§3 결과에 따라 선택)

### 권장: auth 스키마를 복원하지 말고, 이메일 기반 클레임

`auth.users`를 새 프로젝트에 직접 밀어넣는 방법도 있지만 권하지 않습니다. 백업은 2025년 4월의 GoTrue 스키마이고 새 프로젝트는 16개월치 마이그레이션이 반영된 상태입니다. 이 간극은 미묘하게 어긋나기 쉽고, 어긋나면 로그인 자체가 깨집니다.

대신:

1. 새 프로젝트에 `legacy_tombs` 테이블을 만들고 (`email` 유니크 + 묘비 필드 + `claimed_at`), §3의 CSV를 임포트.
   - RLS로 **완전 차단.** 이메일 목록이 들어있는 테이블이므로 anon 키로는 한 줄도 읽히면 안 됩니다. 서버에서 service_role로만 접근.
2. 로그인 콜백에서 이메일이 일치하고 아직 클레임되지 않은 행이 있으면, 새 `user_id`로 `tombs`에 복사하고 `claimed_at` 기록.
3. 사용자에게는 "1년간 방치돼 있던 당신의 묘비를 찾았습니다" 로 보여줍니다.

Google OAuth 전용 앱이라 이메일 매칭은 신뢰할 만합니다. 그 사이 구글 계정 이메일을 바꾼 사람은 매칭에 실패하는데, 이건 감수합니다.

솔직히 말하면 — 1년간 멈춰 있던 묘지를 다시 찾았더니 내 무덤이 그대로 있더라, 는 건 이 제품의 주제와 꽤 잘 맞는 순간입니다. 사용자 수가 구현할 만큼 나온다면 살릴 가치가 있습니다.

---

## 7. 다시 멈추지 않게 (이게 진짜 대책입니다)

무료 티어는 **비활성 7일 후 자동 일시정지**됩니다. 이번 일은 사고가 아니라 정책대로 벌어진 일이고, 아무것도 안 하면 **똑같이 반복됩니다.** 그리고 다음번에도 1년을 넘기면 또 대시보드 복원이 막힙니다.

선택지:

| 방법 | 비용 | 평가 |
|---|---|---|
| **GitHub Actions 주기적 핑** | 무료 | **권장.** 아래 워크플로 하나면 끝 |
| Supabase Pro | $25/월 | 일시정지 없음. 실사용자가 붙기 시작하면 그때 |
| 방치 | 0원 | 1년 뒤 이 문서를 다시 읽게 됩니다 |

### keep-alive 워크플로

**새 프로젝트를 만들고 시크릿을 등록한 뒤에** `.github/workflows/keepalive.yml`로 추가하세요. 시크릿 없이 먼저 커밋하면 매 push마다 실패 알림만 쌓입니다.

```yaml
name: Supabase keep-alive

on:
  schedule:
    - cron: '0 3 * * 1,4'   # 매주 월·목 03:00 UTC
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST
        run: |
          code=$(curl -s -o /dev/null -w '%{http_code}' \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            "${{ secrets.SUPABASE_URL }}/rest/v1/tombs?select=user_id&limit=1")
          echo "HTTP $code"
          # 2xx 면 정상. 그 외에는 실패시켜 알림이 오게 한다.
          [ "$code" -ge 200 ] && [ "$code" -lt 300 ]
```

주 2회면 7일 창을 확실히 덮습니다. 실패하면 GitHub이 알림을 보내주므로, **다음번엔 1년 뒤가 아니라 며칠 안에 알게 됩니다.** 그게 이 워크플로의 진짜 값어치입니다.

> 참고: GitHub은 60일간 레포 활동이 없으면 스케줄 워크플로를 자동 비활성화합니다. 레포가 완전히 잠들면 이것도 멈추므로, 정말 오래 방치할 계획이면 Pro 전환이 정답입니다.

---

## 체크리스트

- [ ] 백업 다운로드, 두 곳에 보관
- [ ] `auth.users` 포함 여부 확인 ← **분기점**
- [ ] 로컬 복원 후 사용자 수 파악
- [ ] `legacy_tombs.csv` 추출 (goat 포함, 레포에 커밋 금지)
- [ ] 새 프로젝트 생성 (동일 리전)
- [ ] 새 스키마 마이그레이션 작성·적용
- [ ] Google OAuth 리디렉션 URI 추가
- [ ] Supabase Auth Redirect Allowlist 설정
- [ ] Vercel 환경변수 3개 갱신
- [ ] keep-alive 워크플로 활성화
- [ ] 로그인 → 게시 → 헌화 전 구간 검증
- [ ] 구 프로젝트 삭제 (맨 마지막에)
