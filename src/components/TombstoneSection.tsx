'use client';

import EpitaphEditor from './EpitaphEditor';
import { useLocale } from './LocaleProvider';

interface Props {
  tombName: string | null;
  /** 각인 전에는 빈 묘비 이미지를 쓴다. */
  placeholder?: string;
  /** 내 묘비에서는 눌러서 바로 고칠 수 있다. 공개 묘비에서는 읽기 전용. */
  editable?: boolean;
}

const DEFAULT_PLACEHOLDER =
  'Δεν ελπίζω τίποτα\nΔε φοβούμαι τίποτα\nΕίμαι λέφτερος';

/**
 * 묘비명은 이제 사용자가 직접 쓰지 않고 LLM 추도문에서 골라 각인한다.
 * 편집은 /me/compose에서만 하므로 여기서는 표시만 한다.
 *
 * 구 코드는 dangerouslySetInnerHTML로 \n을 <br>로 바꿔 렌더했다.
 * 붙여넣은 LLM 답변을 공개 게시하는 지금은 절대 쓸 수 없어
 * white-space: pre-wrap으로 대체했다 (tombstone.scss에 이미 있다).
 */
export default function TombstoneSection({
  tombName,
  placeholder = DEFAULT_PLACEHOLDER,
  editable = false,
}: Props) {
  const engraved = Boolean(tombName?.trim());
  const { t } = useLocale();

  return (
    <div className="tombstone-container relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          engraved
            ? '/assets/images/headstone.svg'
            : '/assets/images/headstone-placeholder.svg'
        }
        alt={t.tomb.tombstoneAlt}
        className="tombstone-image"
        width={366}
        height={560}
      />
      <div className="tombstone-name-overlay">
        {editable ? (
          <EpitaphEditor tombName={tombName} />
        ) : (
          <h2
            className={`text-2xl tombstone-name ${
              engraved ? 'filled-text' : 'placeholder-text'
            }`}
          >
            {engraved ? tombName : placeholder}
          </h2>
        )}
      </div>
    </div>
  );
}
