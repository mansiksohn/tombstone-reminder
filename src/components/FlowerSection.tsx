'use client';

import { useEffect, useState } from 'react';
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
  /** 다시 놓을 수 있을 때까지 남은 초. 0이면 쿨다운이 끝난 것이다. */
  const [cooldown, setCooldown] = useState(0);

  // "잠시 후에"만으로는 얼마나 기다려야 하는지 알 수 없다. 서버가 알려준
  // 초를 1초마다 줄여서 보여준다 — 0이 되면 알아서 사라진다.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const offer = async () => {
    if (busy || cooldown > 0) return;
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
        const data = (await res.json().catch(() => null)) as {
          retryAfterSeconds?: number;
        } | null;
        setCooldown(data?.retryAfterSeconds ?? 30);
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
        {cooldown > 0 ? (
          <span className="flower-notice" aria-live="polite">
            {cooldown}초 후 다시
          </span>
        ) : (
          notice && (
            <span className="flower-notice" aria-live="polite">
              {notice}
            </span>
          )
        )}

        {/*
          예전에는 "+"버튼과 "n송이의 꽃이 놓였습니다" 문구가 따로
          있었는데, 문구가 화면 바닥 전체 폭에 절대 위치라 버튼과 같은
          자리에 겹쳤다. 수량을 버튼 라벨 자체로 옮겨 겹칠 자리를 없앤다.
        */}
        {canOffer ? (
          <button
            className="add-flower-button"
            onClick={offer}
            disabled={busy || cooldown > 0}
            aria-label={
              cooldown > 0
                ? `${cooldown}초 후 다시 놓을 수 있습니다`
                : count > 0
                  ? `꽃 놓기 (${count}송이 놓임)`
                  : '꽃 놓기'
            }
          >
            🌼{count > 0 ? count : '헌화하기'}
          </button>
        ) : (
          count > 0 && <span className="flower-count-badge">🌼{count}</span>
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
    </div>
  );
}
