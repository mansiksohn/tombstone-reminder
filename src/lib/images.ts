export interface DeathMask {
  name: string;
  path: string;
}

const NAMES = [
  'Relieved face',
  'Smiling face with halo',
  'Disappointed face',
  'Knocked-out face',
  'Melting face',
  'Exploding head',
  'Face screaming in fear',
  'Skull',
  'Alien monster',
  'Anatomical heart',
  'Backpack',
  'Baseball',
  'Basketball',
  'Bed',
  'Bomb',
  'Brain',
  'Candy',
  'Canned food',
  'Coffin',
  'Crown',
  'Funeral urn',
  'Game die',
  'Gem stone',
  'Ghost',
  'Glasses',
  'Graduation cap',
  'Guitar',
  'Jar',
  'Laptop',
  'Long drum',
  'Luggage',
  'Microphone',
  'Mirror ball',
  'Mirror',
  'Mobile phone',
  'Package',
  'Pile of poo',
  'Robot',
  'Rock',
  'Soccer ball',
  'Spiral shell',
  'Sunglasses',
  'Teapot',
  'Teddy bear',
  'Top hat',
  'Womans hat',
  'Wood',
  'Wrapped gift',
  'Yarn',
] as const;

export const deathMasks: DeathMask[] = NAMES.map((name) => ({
  name,
  path: `/assets/images/deathmask/${name}.png`,
}));

export const PLACEHOLDER_MASK = '/assets/images/deathmask/Place Skull.png';
export const FALLBACK_MASK = '/assets/images/deathmask/Coffin.png';

/** 저장된 데스마스크 이름을 이미지 경로로. 이름이 없거나 모르면 fallback. */
export function maskPath(name: string | null | undefined, fallback = FALLBACK_MASK) {
  if (!name) return fallback;
  return deathMasks.find((m) => m.name === name)?.path ?? fallback;
}
