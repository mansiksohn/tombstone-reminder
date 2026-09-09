/**
 * LLM이 돌려준 추도문 전문을, 탭해서 고를 수 있는 문장 후보로 쪼갠다.
 *
 * 완벽한 문장 분리기가 아니다 — 한국어 텍스트는 종결 부호가 일관되지
 * 않고(대화체, 줄바꿈만으로 문단을 나누는 경우 등) 완벽한 규칙이
 * 없으므로, 줄바꿈으로 먼저 나누고 너무 긴 줄만 종결부호로 더 쪼갠다.
 * 각인 길이 제한(200자)을 넘는 후보는 보여주지 않는다.
 */
const TOMB_NAME_LIMIT = 200;
const MIN_SENTENCE_LENGTH = 2;

export function splitSentences(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates = lines.flatMap((line) =>
    line.length > TOMB_NAME_LIMIT
      ? line.split(/(?<=[.!?…。])\s+(?=\S)/)
      : [line],
  );

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of candidates) {
    const sentence = raw.trim();
    if (
      sentence.length < MIN_SENTENCE_LENGTH ||
      sentence.length > TOMB_NAME_LIMIT ||
      seen.has(sentence)
    ) {
      continue;
    }
    seen.add(sentence);
    result.push(sentence);
  }

  return result;
}
