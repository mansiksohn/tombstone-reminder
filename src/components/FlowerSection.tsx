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

  // 실패 알림도 카운트다운처럼 스스로 걷힌다 — 다음 클릭까지 남겨둘
  // 이유가 없다.
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(id);
  }, [notice]);

  // 요청이 오가는 동안 버튼을 잠그지 않는다. 분당 한도 안에서는 클릭한
  // 만큼 바로바로 놓이는 게 맞다 — 응답을 기다리며 한 번씩만 받아주면
  // 답답하기만 하다. 넘치는 순간은 서버가 429로 알려주고, 그때부터만
  // 쿨다운으로 막는다.
  const offer = async () => {
    if (cooldown > 0) return;

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
      setNotice('다시 시도');
    }
  };

  // 쿨다운·실패 알림을 버튼 옆에 따로 두면, flex 칸을 하나 더 차지해
  // 꽃 더미의 정지 위치(static position)까지 밀어 올린다 — 꽃은
  // position:absolute라 눈에 보이는 형제가 느는 순간 같이 떠버린다.
  // 그래서 별도 줄을 만들지 않고 버튼 라벨 자체를 이걸로 바꿔치기한다.
  const label =
    cooldown > 0
      ? `${cooldown}초 후`
      : (notice ?? (count > 0 ? `🌼${count}` : '🌼헌화하기'));

  return (
    <div className="flower-section">
      <div className="flower-bowl-container">
        {canOffer ? (
          <button
            className="add-flower-button"
            onClick={offer}
            disabled={cooldown > 0}
            aria-live="polite"
            aria-label={
              cooldown > 0
                ? `${cooldown}초 후 다시 놓을 수 있습니다`
                : notice
                  ? notice
                  : count > 0
                    ? `꽃 놓기 (${count}송이 놓임)`
                    : '꽃 놓기'
            }
          >
            {label}
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
