import React, { useState } from 'react';
import '../styles/DeathMaskSection.scss'; // 스타일 파일 추가
const images = [
    './assets/images/deathmask/Skull.png',
    './assets/images/deathmask/Alien monster.png', 
    './assets/images/deathmask/Anatomical heart.png', 
    './assets/images/deathmask/Backpack.png', 
    './assets/images/deathmask/Baseball.png', 
    './assets/images/deathmask/Basketball.png', 
    './assets/images/deathmask/Bed.png', 
    './assets/images/deathmask/Bomb.png', 
    './assets/images/deathmask/Brain.png', 
    './assets/images/deathmask/Candy.png', 
    './assets/images/deathmask/Canned food.png', 
    './assets/images/deathmask/Coffin.png', 
    './assets/images/deathmask/Crown.png', 
    './assets/images/deathmask/Disappointed face.png', 
    './assets/images/deathmask/Exploding head.png', 
    './assets/images/deathmask/Face screaming in fear.png', 
    './assets/images/deathmask/Funeral urn.png', 
    './assets/images/deathmask/Game die.png', 
    './assets/images/deathmask/Gem stone.png', 
    './assets/images/deathmask/Ghost.png', 
    './assets/images/deathmask/Glasses.png', 
    './assets/images/deathmask/Graduation cap.png', 
    './assets/images/deathmask/Guitar.png', 
    './assets/images/deathmask/Jar.png', 
    './assets/images/deathmask/Knocked-out face.png', 
    './assets/images/deathmask/Laptop.png', 
    './assets/images/deathmask/Long drum.png', 
    './assets/images/deathmask/Luggage.png', 
    './assets/images/deathmask/Melting face.png', 
    './assets/images/deathmask/Microphone.png', 
    './assets/images/deathmask/Mirror ball.png', 
    './assets/images/deathmask/Mirror.png', 
    './assets/images/deathmask/Mobile phone.png', 
    './assets/images/deathmask/Package.png', 
    './assets/images/deathmask/Pile of poo.png', 
    './assets/images/deathmask/Relieved face.png', 
    './assets/images/deathmask/Robot.png', 
    './assets/images/deathmask/Rock.png', 
    './assets/images/deathmask/Skull.png', 
    './assets/images/deathmask/Smiling face with halo.png', 
    './assets/images/deathmask/Soccer ball.png', 
    './assets/images/deathmask/Spiral shell.png', 
    './assets/images/deathmask/Sunglasses.png', 
    './assets/images/deathmask/Teapot.png', 
    './assets/images/deathmask/Teddy bear.png', 
    './assets/images/deathmask/Top hat.png', 
    './assets/images/deathmask/Womans hat.png', 
    './assets/images/deathmask/Wood.png', 
    './assets/images/deathmask/Wrapped gift.png', 
    './assets/images/deathmask/Yarn.png',
];

function DeathMaskSection() {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <div className="death-mask-section">
      <img src={selectedImage} alt="Selected" className="selected-image" />
      <div className="image-selector">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Option ${index}`}
            onClick={() => handleImageClick(image)}
            className="option-image"
          />
        ))}
      </div>
    </div>
  );
}

export default DeathMaskSection;
