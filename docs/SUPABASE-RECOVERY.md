# Supabase 이주 — 진단 결과 및 남은 절차

> 상황: `tombstone-reminder` 프로젝트가 2025-04-25부터 일시정지. 1년 초과로 대시보드 복원 경로가 닫힘.
> **백업 분석 완료 (2026-08-20).** 결론: **데이터를 이관하지 않고 새로 시작한다.**

---

## 1. 백업 분석 결과

`db_cluster25042025031603.backup.gz` (473KB, plain SQL cluster dump)를 열어 확인한 내용.

### 규모

| 항목 | 수치 |
|---|---|
| `auth.users` | 19 |
| `auth.identities` | 19 (전부 Google) |
| `public."Tombs"` | 15 |
| 데이터 생성 기간 | **2024-10-25 ~ 2024-10-30 (6일)** |

`auth` 스키마는 백업에 온전히 들어있어 이메일 매칭이 가능했다. 하지만 아래 이유로 이관하지 않는다.

### 이관하지 않기로 한 근거

**6일치 전시 데이터다.** 모든 행이 2024년 10월 말 엿새 안에 만들어졌고 이후 활동이 없다. 그리고 내용을 보면 완성된 묘비가 거의 없다.

| 컬럼 | 실제 채움 | 판단 |
|---|---|---|
| `goat` | **15건 중 14건이 빈 배열 `[]`** | 폐기 결정이 데이터로 확인됨 |
| `obituary` | **15건 중 1건만 작성** | 사실상 미사용 기능 |
| `tomb_name` | 3건은 비어 있거나 null | |
| `birth_date` | `1233-01-01`, `0421-10-26` 등 오타·테스트값 다수 | |
| `deathmask` | 3건 미선택 | |

GOAT는 15명 중 1명만 썼다. 부고도 1명만 썼다. **폐기와 개편 방향이 데이터와 정확히 일치한다.**

### 함께 발견된 결함

1. **`Tombs` 전체가 익명에게 공개돼 있었다.**
   ```sql
   CREATE POLICY "Enable read access for all users" ON public."Tombs"
     FOR SELECT USING (true);
   ```
   `anon` 키만 있으면 전원의 묘비명·부고·생년월일을 읽을 수 있었다. anon 키는 클라이언트 번들에 들어가므로 **사실상 전체 공개 상태로 운영됐다.** 본인 전용 정책(`allow_select_for_user`)도 함께 걸려 있었지만, PostgreSQL의 다중 정책은 OR로 결합되므로 `USING (true)` 하나가 나머지를 전부 무력화한다.

2. **`user_id`에 `auth.users` 외래키가 없고, 기본값이 `gen_random_uuid()`였다.**
   ```sql
   user_id uuid DEFAULT gen_random_uuid()
   ```
   사용자 식별자의 기본값이 무작위 UUID인 건 의미가 없다. 계정이 지워져도 묘비가 고아로 남는다.

3. **`is_onboarded`가 완료 신호가 아니었다.** 15건 전원이 `true`인데 그중 3건은 묘비명도 데스마스크도 없다. 구 코드의 `upsertSingleValue()`가 **모든 저장에 `is_onboarded: true`를 함께 썼기 때문**에, 이름만 입력해도 온보딩 완료로 기록됐다.

4. **DB 제약이 하나도 없었다.** UI는 묘비명 72자로 막았지만 실제로 78자짜리가, 부고 160자 제한을 넘긴 245자짜리가 저장돼 있다. 검증이 클라이언트에만 있었다.

이 넷은 새 스키마에서 전부 해소했다. → `supabase/migrations/20260820000000_init.sql`

### 백업 파일 취급

원본 `.gz`가 곧 아카이브다. 별도 CSV를 뽑지 않았다 — 19명의 이메일과 개인이 쓴 부고가 들어있어 사본을 늘릴 이유가 없다.

- **레포에 커밋하지 말 것.**
- 원본은 안전한 곳에 보관. 나중에 필요해질 일은 없을 것으로 보이지만, 지우는 건 되돌릴 수 없다.

---

## 2. 남은 절차

### 새 프로젝트 생성

- **리전은 기존과 동일하게** (한국 사용자 대상이면 `ap-northeast-2` 서울).
- 구 프로젝트는 **당장 삭제하지 말 것.** 이주가 끝나고 새 환경이 검증될 때까지 둔다.
- 확보할 값: Project URL, `anon` key, `service_role` key.

### 스키마 적용

```bash
supabase link --project-ref <새-ref>
supabase db push
```

또는 대시보드 SQL Editor에 `supabase/migrations/20260820000000_init.sql` 내용을 붙여넣어 실행.

> 이 마이그레이션은 로컬 PostgreSQL 16에 실제로 적용해 검증했다. 가입 트리거, slug 생성(10,000개 무충돌), 각 제약조건, 그리고 RLS를 anon·authenticated·service_role 각 역할에서 확인했다.

### 설정 변경 목록

| 대상 | 조치 |
|---|---|
| Google Cloud Console | 승인된 리디렉션 URI에 `https://<새ref>.supabase.co/auth/v1/callback` 추가 |
| Supabase → Auth → URL Configuration | Site URL `https://tombstone.vercel.app`, Redirect Allowlist에 `https://tombstone.vercel.app/auth/callback` 과 `http://localhost:3000/auth/callback` |
| Supabase → Auth → Providers | Google 활성화, 구 프로젝트의 Client ID/Secret 재사용 가능 |
| Vercel 환경변수 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Production/Preview/Development 전부 |
| 구 `REACT_APP_*` 변수 | 이관 완료 후 삭제 |

구 프로젝트의 리디렉션 URI는 Google Console에서 지우지 말고 남겨둔다. 롤백 여지를 없앨 이유가 없다.

---

## 3. 다시 멈추지 않게

무료 티어는 **7일 비활성이면 자동 정지**된다. 이번 일은 사고가 아니라 정책대로 벌어진 것이고, 아무것도 하지 않으면 **똑같이 반복된다.** 그리고 다음번에도 1년을 넘기면 또 대시보드 복원이 막힌다.

| 방법 | 비용 | 평가 |
|---|---|---|
| **GitHub Actions 주기적 핑** | 무료 | **권장** |
| Supabase Pro | $25/월 | 실사용자가 붙으면 그때 |
| 방치 | 0원 | 1년 뒤 이 문서를 다시 읽게 된다 |

**새 프로젝트를 만들고 GitHub 시크릿(`SUPABASE_URL`, `SUPABASE_ANON_KEY`)을 등록한 뒤에** `.github/workflows/keepalive.yml`로 추가할 것. 시크릿 없이 먼저 커밋하면 실패 알림만 쌓인다.

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
            "${{ secrets.SUPABASE_URL }}/rest/v1/tombs?select=slug&limit=1")
          echo "HTTP $code"
          [ "$code" -ge 200 ] && [ "$code" -lt 300 ]
```

주 2회면 7일 창을 확실히 덮는다. 실패하면 GitHub이 알림을 보내므로 **다음엔 1년 뒤가 아니라 며칠 안에 알게 된다.** 그게 이 워크플로의 진짜 값어치다.

> 주의: GitHub은 60일간 레포 활동이 없으면 스케줄 워크플로를 자동 비활성화한다. 정말 오래 방치할 계획이면 Pro 전환이 정답이다.

---

## 체크리스트

- [x] 백업 다운로드
- [x] `auth` 스키마 포함 확인 — 포함됨
- [x] 실사용자 수 파악 — 19계정/15묘비, 6일치 전시 데이터
- [x] 이관 여부 판단 — **이관하지 않음**
- [x] 새 스키마 마이그레이션 작성·검증
- [ ] 새 Supabase 프로젝트 생성 (동일 리전)
- [ ] 마이그레이션 적용
- [ ] Google OAuth 리디렉션 URI 추가
- [ ] Supabase Auth Redirect Allowlist 설정
- [ ] Vercel 환경변수 3개 갱신
- [ ] keep-alive 워크플로 활성화
- [ ] 로그인 → 게시 → 헌화 전 구간 검증
- [ ] 구 프로젝트 삭제 (맨 마지막에)
