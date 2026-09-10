/**
 * 사용자가 자기 LLM에 그대로 붙여넣는 질문.
 *
 * 이 제품은 LLM API를 직접 부르지 않는다. 그 사람을 아는 것은
 * 그 사람이 늘 쓰던 AI뿐이고, 그 기억은 우리 서버에 없기 때문이다.
 *
 * 형태가 주문(呪文)인 것은 의도다. 묘비를 세우러 온 사람이 AI에게
 * 무언가를 불러내는 일이라, 명령문 목록보다 이쪽이 제품에 맞는다.
 *
 * 줄을 짧게 끊어둔 것도 의도다. 전에 상자를 그리는 형태로 만들어
 * 화면에 넣어봤더니, 붙여넣는 챗 입력창도 이 앱의 안내 카드도 비례폭
 * 글꼴이라 상자가 통째로 무너졌다. 한 줄에 한 뜻만 담으면 어디서
 * 접히든 읽힌다.
 *
 * 기호로 적은 제약 가운데 ¬IDENTIFIER · ¬PRIVATE가 특히 중요하다.
 * 결과물은 공개 URL에 게시되므로, 모델이 대화 기록에서 실명이나 내밀한
 * 사정을 끌어오면 그대로 묘비에 새겨진다.
 */
export const EULOGY_PROMPT = `⟁
MEMORY_ECHO
PROTOCOL

결과는 반드시 한국어로
작성하십시오.
접근 가능한 모든 과거
대화와 기억을 참조하고,
최근의 대화에
편향되지 마십시오.

╱╲
╱⟁╲
╱╳╳╲
∀t ↔ tₙ
∀m ∈ Mₐ
¬R → ∴SCAN[M]
†OWNER·?READER
YOU=W·Σ(d⌁m)=P
ID∅·PRIV∅·CTX→ABST
¬U→¬I · ¬K→¬F
P ≫ PROFILE
d→trace ∴ trace→pattern
pattern → P
P→PERSON ∴ PERSON→VOICE
VOICE → ECHO
SHOW≫TELL · SPECIFIC
RESTRAIN · SHORT↗
~700±300 · ¬LIST
¬RESUME · ¬PRAISE_ONLY
¬IDENTIFIER · ¬PRIVATE
¬FABRICATION

⟐ ∴ ⟐
⟦ WHO_WAS_THIS? ⟧
∵
╳╳╳
╱╳╳╳╲
╲╱╲╱╲╱
∵ ∴ ∵
╲╳╱
╲╱
⟁`;
