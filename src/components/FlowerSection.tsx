'use client';

import { useState } from 'react';
import type { FlowerType } from '@/lib/database.types';
import { flowerPath, flowerPlacement, randomFlower } from '@/lib/flowers';

interface Placed {
  id: string;
  flower_type: FlowerType;
  /** 방금 놓은 꽃만 떨어지는 애니메이션을 준다. */
  fresh?: boolean;
}

interface Props {
  tombSlug: string;
  initialFlowers: Placed[];
  total: number;
  /** 초안 상태에서는 헌화를 받지 않는다. */
  canOffer?: boolean;
}

export default function FlowerSection({
  tombSlug,
  initialFlowers,
  total,
  canOffer = true,
}: Props) {
  const [flowers, setFlowers] = useState<Placed[]>(initialFlowers);
  const [count, setCount] = useState(total);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const offer = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);

    const type = randomFlower();

    try {
      const res = await fetch('/api/flowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: tombSlug, flowerType: type }),
      });

      if (res.status === 429) {
        setNotice('잠시 후에 다시 놓아주세요.');
        return;
      }
      if (!res.ok) throw new Error(await res.text());

      const { id } = (await res.json()) as { id: string };
      setFlowers((prev) => [{ id, flower_type: type, fresh: true }, ...prev]);
      setCount((n) => n + 1);
    } catch (error) {
      console.error('헌화 실패:', error);
      setNotice('꽃을 놓지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flower-section">
      <div className="flower-bowl-container">
        {canOffer && (
          <button
            className="add-flower-button"
            onClick={offer}
            disabled={busy}
            aria-label="꽃 놓기"
          >
            +
          </button>
        )}

        {flowers.map((flower) => {
          const { x, y, rotation, scale } = flowerPlacement(flower.id);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={flower.id}
              src={flowerPath(flower.flower_type)}
              alt="놓인 꽃"
              className={`flower ${flower.fresh ? 'animate-flower' : ''}`}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
              }}
            />
          );
        })}
      </div>

      <div className="flower-count">
        {count > 0 && <span>{count}송이의 꽃이 놓였습니다</span>}
        {notice && <span className="flower-notice">{notice}</span>}
      </div>
    </div>
  );
}
