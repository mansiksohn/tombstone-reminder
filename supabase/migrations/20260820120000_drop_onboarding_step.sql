-- 온보딩 챗 폐지에 따른 정리.
--
-- 이름·생일·데스마스크를 묻던 3단계 챗은 묘비를 만들기 전에 서 있던
-- 문턱이었다. 이제 이 셋은 묘비가 만들어진 뒤 /me에서 선택적으로
-- 꾸미는 요소가 되었고, 진행도를 셀 이유가 사라졌다.
alter table public.tombs drop column if exists onboarding_step;
