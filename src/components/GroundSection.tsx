'use client';

import { useLocale } from './LocaleProvider';

export default function GroundSection() {
  const { t } = useLocale();

  return (
    <div className="ground-container">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/images/ground.jpg"
        alt={t.tomb.groundAlt}
        className="ground-image"
        width={390}
        height={224}
      />
    </div>
  );
}
