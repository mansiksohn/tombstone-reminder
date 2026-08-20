'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

interface Props {
  value: string | null;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
  inputClassName: string;
  displayClassName?: string;
  showCount?: boolean;
  countClassName?: string;
  onSave: (value: string) => Promise<{ ok: boolean; error?: string }>;
  children: (value: string | null) => React.ReactNode;
}

/**
 * 클릭하면 편집, 벗어나면 저장.
 *
 * 구 코드에는 이 패턴이 UserNameSection·TombstoneSection·ObituarySection·
 * DatesSection에 각각 복사돼 있었고, 바깥 클릭 감지 useEffect도 넷 다
 * 따로 갖고 있었다. 하나로 합쳤다.
 */
export default function EditableText({
  value,
  placeholder,
  maxLength,
  multiline = false,
  inputClassName,
  displayClassName,
  showCount = false,
  countClassName,
  onSave,
  children,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value ?? '');
  }, [value, editing]);

  const commit = () => {
    if (!editing) return;
    setEditing(false);

    const next = draft.trim();
    if (next === (value ?? '').trim()) return;

    startTransition(async () => {
      const result = await onSave(next);
      if (!result.ok) {
        setError(result.error ?? '저장하지 못했습니다.');
        setDraft(value ?? '');
      } else {
        setError(null);
      }
    });
  };

  useEffect(() => {
    if (!editing) return;

    const onPointerDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        commit();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, draft, value]);

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className={displayClassName}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
      >
        {children(value)}
        {pending && <span className="sr-only">저장 중</span>}
        {error && <p className="text-soul-red text-sm mt-1">{error}</p>}
      </div>
    );
  }

  const shared = {
    value: draft,
    autoFocus: true,
    maxLength,
    placeholder,
    className: inputClassName,
    onBlur: commit,
  };

  return (
    <div ref={boxRef} className="relative flex items-center justify-center">
      {multiline ? (
        <textarea
          {...shared}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(value ?? '');
              setEditing(false);
            }
          }}
        />
      ) : (
        <input
          {...shared}
          type="text"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(value ?? '');
              setEditing(false);
            }
          }}
        />
      )}
      {showCount && (
        <span className={countClassName}>
          {draft.length}/{maxLength}
        </span>
      )}
    </div>
  );
}
