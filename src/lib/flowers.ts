import type { FlowerType } from '@/lib/database.types';

export const FLOWER_TYPES: FlowerType[] = [
  'Blossom',
  'Bouquet',
  'Hibiscus',
  'Rose',
  'Sunflower',
  'Tulip',
];

export function flowerPath(type: FlowerType) {
  return `/assets/images/${type}.svg`;
}

export function randomFlower(): FlowerType {
  return FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
}

/**
 * 꽃 id로부터 배치를 결정한다.
 *
 * 구현이 `Math.random()`이었을 때는 리렌더마다 꽃이 자리를 옮겼다.
 * 헌화가 영속되는 이상 위치도 고정이어야 한다 — 다시 찾아왔을 때
 * 내가 둔 꽃이 그 자리에 있어야 하니까.
 */
export function flowerPlacement(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }

  const at = (shift: number) => {
    const n = Math.abs(hash >> shift) % 1000;
    return n / 1000;
  };

  return {
    x: at(0) * 100 - 50,
    y: at(4) * 50 - 70,
    rotation: at(8) * 120 - 60,
    scale: 0.9 + at(12) * 0.2,
  };
}
