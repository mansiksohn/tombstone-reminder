'use client';

import { useEffect, useState } from 'react';
import type { FlowerType } from '@/lib/database.types';
import { flowerPath, flowerPlacement, randomFlower } from '@/lib/flowers';
import { useLocale } from './LocaleProvider';

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
  const { t } = useLocale();
  const [flowers, setFlowers] = useState<Placed[]>(initialFlowers);
  const [count, setCount] = useState(total);
  const [notice, setNotice] = useState<string | null>(null);
  /** 다시 놓을 수 있을 때까지 남은 초. 0이면 쿨다운이 끝난 것이다. */
  const [cooldown, setCooldown] = useState(0);
  /** 한도에 걸린 순간을 잠깐만 알리고, 그 뒤로는 다시 꽃 수를 보여준다. */
  const [showCooldown, setShowCooldown] = useState(false);
  /**
   * showCooldown을 true로 "다시" 세팅해도 값이 안 바뀌면 effect가
   * 재실행되지 않아 이미 돌고 있던 3초 타이머가 그대로 만료된다.
   * 매번 값이 바뀌는 카운터를 별도로 두어 재클릭 때마다 타이머를 새로 잡는다.
   */
  const [cooldownNoticeTick, setCooldownNoticeTick] = useState(0);

  // "잠시 후에"만으로는 얼마나 기다려야 하는지 알 수 없다. 서버가 알려준
  // 초를 1초마다 줄여서 보여준다 — 0이 되면 알아서 사라진다.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // 화면을 캡처하고 싶은 사람은 꽃이 몇 송이인지 보이는 상태를 원할
  // 것이다. 한도에 걸렸다는 건 3초만 알리고, 남은 대기 시간 동안은
  // (버튼은 여전히 눌리지 않지만) 라벨을 원래의 꽃 수로 되돌려둔다.
  useEffect(() => {
    if (cooldownNoticeTick === 0) return;
    const id = setTimeout(() => setShowCooldown(false), 3000);
    return () => clearTimeout(id);
  }, [cooldownNoticeTick]);

  // 쿨다운 알림을 (다시) 띄운다. showCooldown은 클릭한 그 순간 바로 켜고,
  // tick은 위 effect가 3초 타이머를 새로 잡게 하는 용도로만 쓴다.
  const notifyCooldown = () => {
    setShowCooldown(true);
    setCooldownNoticeTick((n) => n + 1);
  };

  // 실패 알림도 스스로 걷힌다 — 다음 클릭까지 남겨둘 이유가 없다.
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(id);
  }, [notice]);

  const withdraw = (id: string) => {
    setFlowers((prev) => prev.filter((f) => f.id !== id));
    setCount((n) => n - 1);
  };

  // 클릭한 순간 바로 보여준다 — 응답을 기다렸다 하나씩 반영하면
  // 클릭과 화면이 따로 노는 것처럼 보인다. 실패하면 그때 되돌린다.
  // 요청이 오가는 동안 버튼을 잠그지도 않는다. 분당 한도 안에서는
  // 클릭한 만큼 바로바로 놓이는 게 맞다.
  const offer = async () => {
    if (cooldown > 0) {
      // 이미 한도에 걸려 있다는 걸 다시 눌러도 알 수 있어야 한다 —
      // 처음 걸렸을 때와 같은 3초짜리 알림을 다시 띄운다.
      notifyCooldown();
      return;
    }

    const type = randomFlower();
    const id =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    setFlowers((prev) => [{ id, flower_type: type, fresh: true }, ...prev]);
    setCount((n) => n + 1);

    try {
      const res = await fetch('/api/flowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: tombSlug, flowerType: type }),
      });
      if (!res.ok) throw new Error(await res.text());

      const data = (await res.json()) as {
        limited?: boolean;
        retryAfterSeconds?: number;
        id?: string;
      };

      // 한도 도달은 실패가 아니라 정상적인 결과라 200으로 온다 — 그래야
      // 브라우저가 콘솔에 "Failed to load resource"를 자동으로 찍지
      // 않는다. 이 흐름에서는 애초에 놓이지 못했으니 낙관적으로 더했던
      // 꽃을 되돌린다.
      if (data.limited) {
        withdraw(id);
        setCooldown(data.retryAfterSeconds ?? 30);
        notifyCooldown();
      } else if (data.id) {
        // 실제 DB id로 바꿔치기한다. flowerPlacement가 id로 위치를
        // 계산하므로, 임시 id를 그대로 두면 새로고침 후 실제 id로 다시
        // 계산될 때 이 꽃만 자리가 바뀐 것처럼 보인다.
        const realId = data.id;
        setFlowers((prev) =>
          prev.map((f) => (f.id === id ? { ...f, id: realId } : f)),
        );
      }
    } catch (error) {
      console.error('헌화 실패:', error);
      withdraw(id);
      setNotice(t.flower.retryNotice);
    }
  };

  // 쿨다운·실패 알림을 버튼 옆에 따로 두면, flex 칸을 하나 더 차지해
  // 꽃 더미의 정지 위치(static position)까지 밀어 올린다 — 꽃은
  // position:absolute라 눈에 보이는 형제가 느는 순간 같이 떠버린다.
  // 그래서 별도 줄을 만들지 않고 버튼 라벨 자체를 이걸로 바꿔치기한다.
  const label =
    cooldown > 0 && showCooldown
      ? t.flower.sleepLabel(cooldown)
      : (notice ?? (count > 0 ? t.flower.countLabel(count) : t.flower.offerLabel));

  return (
    <div className="flower-section">
      <div className="flower-bowl-container">
        {/*
          native disabled이면 클릭 자체가 브라우저에서 막혀 onClick이
          불리지 않는다 — 쿨다운 도중 다시 눌러도 알림을 못 띄운다.
          그래서 disabled 대신 aria-disabled로 의미만 전달하고, 실제
          차단은 offer() 안의 cooldown 체크가 맡는다.
        */}
        {canOffer ? (
          <button
            className="add-flower-button"
            onClick={offer}
            aria-disabled={cooldown > 0}
            aria-live="polite"
            aria-label={
              cooldown > 0
                ? t.flower.ariaCooldown(cooldown)
                : notice
                  ? notice
                  : count > 0
                    ? t.flower.ariaOfferWithCount(count)
                    : t.flower.ariaOffer
            }
          >
            {label}
          </button>
        ) : (
          count > 0 && (
            <span className="flower-count-badge">{t.flower.countLabel(count)}</span>
          )
        )}

        {/*
          flowers는 최신순(index 0이 가장 최근)이다. 같은 z-index에서는
          나중에 그려진 형제가 위로 오므로, 최신 꽃이 앞에 보이려면
          그리는 순서는 거꾸로 — 오래된 것부터 그려서 최신이 맨 나중에,
          즉 맨 위에 오게 한다.
        */}
        {[...flowers].reverse().map((flower) => {
          const { x, y, rotation, scale } = flowerPlacement(flower.id);
          return (
            // 자리 배치(transform)와 낙하 애니메이션(transform)을 같은
            // 엘리먼트에 같이 걸면 CSS 애니메이션이 인라인 transform을
            // 통째로 덮어써 x/회전/크기가 다 무시되고 y축으로만 똑바로
            // 떨어진다. 바깥 div가 자리를, 안쪽 img가 낙하만 맡도록
            // 나눠 서로 간섭하지 않게 한다.
            <div
              key={flower.id}
              className="flower"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flowerPath(flower.flower_type)}
                alt={t.tomb.flowerAlt}
                className={flower.fresh ? 'animate-flower' : ''}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
