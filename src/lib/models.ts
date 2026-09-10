import type { EulogySource } from '@/lib/database.types';

/**
 * 추도문을 받아올 수 있는 AI들.
 *
 * DB의 eulogy_source 제약과 같은 목록이다. 예전에는 CreateFlow 안에
 * 따로 적혀 있었는데, 랜딩에서도 같은 목록이 필요해지면서 한 곳으로
 * 모았다.
 */
export interface AiModel {
  value: EulogySource;
  label: string;
  /** 새 대화 화면. '그 외'는 가리킬 곳이 없다. */
  url?: string;
}

/**
 * 주소에 질문을 실어 보내지 않는 이유:
 *
 * chatgpt.com의 `?q=` 같은 파라미터는 문서화된 규격이 아니고, 무엇보다
 * **모바일 앱에서는 무시된다**. 이 제품은 사실상 모바일 전용이라 그쪽이
 * 기본값인데, 거기서 안 되는 것을 주된 수단으로 삼을 수는 없다.
 *
 * 그래서 실제로 일하는 것은 클립보드다. 버튼을 누르면 질문을 복사하면서
 * 그 AI를 새 탭으로 연다. 붙여넣기 한 번이면 된다.
 */
export const AI_MODELS: AiModel[] = [
  { value: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { value: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
  { value: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
  { value: 'other', label: '그 외' },
];

/** 링크를 걸 수 있는 것만. 랜딩의 '복사해서 바로 열기'에 쓰인다. */
export const LINKABLE_MODELS = AI_MODELS.filter(
  (model): model is AiModel & { url: string } => Boolean(model.url),
);
