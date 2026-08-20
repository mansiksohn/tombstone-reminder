'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { saveField } from '@/lib/actions';
import { deathMasks, maskPath, PLACEHOLDER_MASK } from '@/lib/images';

interface Props {
  deathmask: string | null;
  editable?: boolean;
}

/**
 * 구 컴포넌트는 자기 몫의 userId를 따로 조회하고 supabase를 직접 update했다.
 * 이제 값은 위에서 내려받고 저장은 서버 액션 한 곳을 지난다.
 */
export default function DeathMaskSection({
  deathmask,
  editable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(deathmask);
  const [, startTransition] = useTransition();
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSelected(deathmask), [deathmask]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const pick = (name: string) => {
    setSelected(name);
    setOpen(false);
    startTransition(() => {
      void saveField('deathmask', name);
    });
  };

  return (
    <div className="death-mask-section p-4">
      <div className="coffin p-4 rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={maskPath(selected, editable ? PLACEHOLDER_MASK : undefined)}
          alt={selected ?? '묻어둔 것'}
          className="selected-image"
          onClick={editable ? () => setOpen((v) => !v) : undefined}
        />
      </div>

      {editable && open && (
        <div className="image-selector" ref={selectorRef}>
          <div className="grid grid-cols-7 gap-2 mx-auto">
            {deathMasks.map((mask) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={mask.name}
                src={mask.path}
                alt={mask.name}
                onClick={() => pick(mask.name)}
                className="option-image cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
