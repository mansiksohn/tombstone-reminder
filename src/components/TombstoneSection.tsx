interface Props {
  tombName: string | null;
  /** 각인 전에는 빈 묘비 이미지를 쓴다. */
  placeholder?: string;
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
}: Props) {
  const engraved = Boolean(tombName?.trim());

  return (
    <div className="tombstone-container relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          engraved
            ? '/assets/images/headstone.svg'
            : '/assets/images/headstone-placeholder.svg'
        }
        alt="묘비"
        className="tombstone-image"
      />
      <div className="tombstone-name-overlay">
        <h2
          className={`text-2xl tombstone-name ${
            engraved ? 'filled-text' : 'placeholder-text'
          }`}
        >
          {engraved ? tombName : placeholder}
        </h2>
      </div>
    </div>
  );
}
