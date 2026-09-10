'use client';

import { saveField } from '@/lib/actions';
import { EPITAPH_MAX } from '@/lib/limits';
import EditableText from './EditableText';

/**
 * 묘비에 새긴 문장을 그 자리에서 고친다.
 *
 * 지금까지 각인을 바꾸려면 /new로 돌아가 추도문 붙여넣기부터 다시
 * 밟아야 했다. 한 문장만 다듬고 싶은 사람에게는 너무 먼 길이다.
 *
 * saveField를 이 컴포넌트가 직접 부른다. 서버 컴포넌트인
 * TombstoneSection에서 함수를 프롭으로 내려보낼 수는 없기 때문이다.
 */
export default function EpitaphEditor({ tombName }: { tombName: string | null }) {
  return (
    <EditableText
      value={tombName}
      placeholder={`묘비에 새길 문장 (${EPITAPH_MAX}자 이하)`}
      maxLength={EPITAPH_MAX}
      multiline
      inputClassName="epitaph-input"
      displayClassName="epitaph-display"
      showCount
      countClassName="epitaph-char-count"
      onSave={(value) => saveField('tomb_name', value)}
    >
      {(value) => {
        const engraved = Boolean(value?.trim());
        return (
          <h2
            className={`text-2xl tombstone-name ${
              engraved ? 'filled-text' : 'placeholder-text'
            }`}
          >
            {engraved ? value : '눌러서 문장을 새기세요'}
          </h2>
        );
      }}
    </EditableText>
  );
}
