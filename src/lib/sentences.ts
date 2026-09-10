import { EPITAPH_MAX } from '@/lib/limits';

/**
 * LLM이 돌려준 추도문 전문을, 탭해서 고를 수 있는 문장 후보로 쪼갠다.
 *
 * 완벽한 문장 분리기가 아니다 — 한국어 텍스트는 종결 부호가 일관되지
 * 않고(대화체, 줄바꿈만으로 문단을 나누는 경우 등) 완벽한 규칙이
 * 없으므로, 줄바꿈으로 먼저 나누고 너무 긴 줄만 종결부호로 더 쪼갠다.
 * 각인 길이 제한을 넘는 후보는 보여주지 않는다. 목록에 떠 있는데 고르면
 * 서버가 거절하는 상태가 제일 나쁘기 때문이다. 다 걸러져 후보가 하나도
 * 남지 않으면 화면이 '직접 다듬기'로 안내한다.
 */
const MIN_SENTENCE_LENGTH = 2;

/**
 * 후보에서 마크다운 장식을 걷어낸다.
 *
 * 실제 LLM은 평문만 주지 않는다. 제목(##), 목록(-, 1.), 인용(>), 강조(**)를
 * 섞어 내놓는 편이 오히려 흔하다. 그대로 두면 '> "잘 살았다"' 같은 후보가
 * 목록에 뜨고, 고르면 묘비에 꺾쇠와 별표가 새겨진다.
 *
 * 원문(추도문 전문)은 건드리지 않는다. 여기서 다듬는 것은 '한 문장을 고르는'
 * 목록에 보여줄 후보뿐이다.
 */
function stripMarkdown(line: string): string {
  return line
    // 줄 앞의 인용·제목·목록 표시. 중첩될 수 있어 반복해서 벗긴다.
    .replace(/^(\s*(?:>+\s*|#{1,6}\s+|[-*+]\s+|\d+[.)]\s+))+/, '')
    // 굵게·기울임·취소선·인라인 코드
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    // [보이는 글자](주소) → 보이는 글자
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // 남은 홑별표 강조. 앞뒤에 공백을 요구하면 안 된다 — 한국어는 닫는
    // 별표 뒤에 조사가 바로 붙는다("*그것*이었습니다"). 대신 별표 안쪽이
    // 공백으로 시작·끝나지 않게 해서 곱셈 기호(3 * 4)는 건드리지 않는다.
    .replace(/\*(?!\s)([^*\n]+?)(?<!\s)\*/g, '$1')
    .trim();
}

/** 구분선 같은, 글이 아닌 줄. */
const RULE_ONLY = /^\s*([-*_])\s*(\1\s*){2,}$/;

export function splitSentences(text: string): string[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates = lines.flatMap((line) =>
    line.length > EPITAPH_MAX
      ? line.split(/(?<=[.!?…。])\s+(?=\S)/)
      : [line],
  );

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of candidates) {
    if (RULE_ONLY.test(raw)) continue;

    const sentence = stripMarkdown(raw);
    if (
      sentence.length < MIN_SENTENCE_LENGTH ||
      sentence.length > EPITAPH_MAX ||
      seen.has(sentence)
    ) {
      continue;
    }
    seen.add(sentence);
    result.push(sentence);
  }

  return result;
}
