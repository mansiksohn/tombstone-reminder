import type { EulogySource } from '@/lib/database.types';

/**
 * 로그인 전에 만든 묘비 초안을 브라우저에 잠시 보관한다.
 *
 * 로그인을 게시 직전으로 미룬 대가로, 그 전까지의 작업은 DB가 아니라
 * 여기에 있다. 게시 버튼을 누르면 초안을 넣어두고 구글 로그인으로
 * 보냈다가, 돌아왔을 때 꺼내어 이어서 게시한다.
 *
 * sessionStorage를 쓰는 이유는 탭을 닫으면 사라지는 편이 맞기 때문이다.
 * 남의 기기에 남에게 보일 추도문이 남아 있을 이유가 없다.
 */
const KEY = 'tombstone:draft';

export interface Draft {
  eulogy: string;
  source: EulogySource | null;
  sentence: string;
}

export function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // 프라이빗 모드 등에서 막힐 수 있다. 초안을 잃을 뿐 흐름은 막지 않는다.
  }
}

export function readDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (typeof parsed.eulogy !== 'string' || !parsed.eulogy.trim()) return null;

    return {
      eulogy: parsed.eulogy,
      source: (parsed.source as EulogySource | null) ?? null,
      sentence: typeof parsed.sentence === 'string' ? parsed.sentence : '',
    };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // 위와 같다.
  }
}
