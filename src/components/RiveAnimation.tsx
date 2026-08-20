'use client';

import { useRive } from '@rive-app/react-canvas';

export default function RiveAnimation() {
  const { RiveComponent } = useRive({
    src: '/assets/animations/incense_stick.riv',
    autoplay: true,
  });

  return <RiveComponent className="splash-animation w-full" />;
}
