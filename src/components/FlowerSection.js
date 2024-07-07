import React, { useState } from 'react';
import '../styles/flower-section.scss';

const flowers = [
  '/assets/images/Blossom.svg',
  '/assets/images/Bouquet.svg',
  '/assets/images/Hibiscus.svg',
  '/assets/images/Rose.svg',
  '/assets/images/Sunflower.svg',
  '/assets/images/Tulip.svg',
];

const getRandomFlower = () => {
  const randomIndex = Math.floor(Math.random() * flowers.length);
  return flowers[randomIndex];
};

const FlowerSection = () => {
  const [flowerPositions, setFlowerPositions] = useState([]);

  const handleAddFlower = () => {
    const randomFlower = getRandomFlower();
    const newFlower = {
      id: Date.now(), // Unique ID for each flower
      src: randomFlower,
      rotation: Math.random() * (-120) + 60,
      size: 0.9 + Math.random() * 0.2,
      position: {
        x: Math.random() * 100 - 50,
        y: Math.random() * 50 - 70,
      },
      animate: true,
    };
    setFlowerPositions([...flowerPositions, newFlower]);

    // Remove animation class after animation ends
    setTimeout(() => {
      setFlowerPositions((prevFlowers) =>
        prevFlowers.map((flower) =>
          flower.id === newFlower.id ? { ...flower, animate: false } : flower
        )
      );
    }, 1000); // Duration of the animation

    // Fade out and remove flower after 10 seconds
    setTimeout(() => {
      setFlowerPositions((prevFlowers) =>
        prevFlowers.map((flower) =>
          flower.id === newFlower.id ? { ...flower, fadeOut: true } : flower
        )
      );
    }, 9000); // Time after which the flower should start fading out

    setTimeout(() => {
      setFlowerPositions((prevFlowers) =>
        prevFlowers.filter((flower) => flower.id !== newFlower.id)
      );
    }, 10000); // Time after which the flower should be removed
  };

  return (
    <div className="flower-section">
      <div className="flower-bowl-container">
        <button className="add-flower-button" onClick={handleAddFlower}>+</button>
        {flowerPositions.map((flower) => (
          <img
            key={flower.id}
            src={flower.src}
            alt={`Flower ${flower.id}`}
            className={`flower ${flower.animate ? 'animate-flower' : ''} ${flower.fadeOut ? 'fade-out' : ''}`}
            style={{
              transform: `translate(${flower.position.x}px, ${flower.position.y}px) rotate(${flower.rotation}deg) scale(${flower.size})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FlowerSection;
