import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient'; // default import 사용
import '../styles/DeathMaskSection.scss';

const images = [
  { name: 'Relieved face', path: './assets/images/deathmask/Relieved face.png' },
  { name: 'Smiling face with halo', path: './assets/images/deathmask/Smiling face with halo.png' },
  { name: 'Disappointed face', path: './assets/images/deathmask/Disappointed face.png' },
  { name: 'Knocked-out face', path: './assets/images/deathmask/Knocked-out face.png' },
  { name: 'Melting face', path: './assets/images/deathmask/Melting face.png' },
  { name: 'Exploding head', path: './assets/images/deathmask/Exploding head.png' },
  { name: 'Face screaming in fear', path: './assets/images/deathmask/Face screaming in fear.png' },
  { name: 'Skull', path: './assets/images/deathmask/Skull.png' },
  { name: 'Alien monster', path: './assets/images/deathmask/Alien monster.png' },
  { name: 'Anatomical heart', path: './assets/images/deathmask/Anatomical heart.png' },
  { name: 'Backpack', path: './assets/images/deathmask/Backpack.png' },
  { name: 'Baseball', path: './assets/images/deathmask/Baseball.png' },
  { name: 'Basketball', path: './assets/images/deathmask/Basketball.png' },
  { name: 'Bed', path: './assets/images/deathmask/Bed.png' },
  { name: 'Bomb', path: './assets/images/deathmask/Bomb.png' },
  { name: 'Brain', path: './assets/images/deathmask/Brain.png' },
  { name: 'Candy', path: './assets/images/deathmask/Candy.png' },
  { name: 'Canned food', path: './assets/images/deathmask/Canned food.png' },
  { name: 'Coffin', path: './assets/images/deathmask/Coffin.png' },
  { name: 'Crown', path: './assets/images/deathmask/Crown.png' },
  { name: 'Funeral urn', path: './assets/images/deathmask/Funeral urn.png' },
  { name: 'Game die', path: './assets/images/deathmask/Game die.png' },
  { name: 'Gem stone', path: './assets/images/deathmask/Gem stone.png' },
  { name: 'Ghost', path: './assets/images/deathmask/Ghost.png' },
  { name: 'Glasses', path: './assets/images/deathmask/Glasses.png' },
  { name: 'Graduation cap', path: './assets/images/deathmask/Graduation cap.png' },
  { name: 'Guitar', path: './assets/images/deathmask/Guitar.png' },
  { name: 'Jar', path: './assets/images/deathmask/Jar.png' },
  { name: 'Laptop', path: './assets/images/deathmask/Laptop.png' },
  { name: 'Long drum', path: './assets/images/deathmask/Long drum.png' },
  { name: 'Luggage', path: './assets/images/deathmask/Luggage.png' },
  { name: 'Microphone', path: './assets/images/deathmask/Microphone.png' },
  { name: 'Mirror ball', path: './assets/images/deathmask/Mirror ball.png' },
  { name: 'Mirror', path: './assets/images/deathmask/Mirror.png' },
  { name: 'Mobile phone', path: './assets/images/deathmask/Mobile phone.png' },
  { name: 'Package', path: './assets/images/deathmask/Package.png' },
  { name: 'Pile of poo', path: './assets/images/deathmask/Pile of poo.png' },
  { name: 'Robot', path: './assets/images/deathmask/Robot.png' },
  { name: 'Rock', path: './assets/images/deathmask/Rock.png' },
  { name: 'Soccer ball', path: './assets/images/deathmask/Soccer ball.png' },
  { name: 'Spiral shell', path: './assets/images/deathmask/Spiral shell.png' },
  { name: 'Sunglasses', path: './assets/images/deathmask/Sunglasses.png' },
  { name: 'Teapot', path: './assets/images/deathmask/Teapot.png' },
  { name: 'Teddy bear', path: './assets/images/deathmask/Teddy bear.png' },
  { name: 'Top hat', path: './assets/images/deathmask/Top hat.png' },
  { name: 'Womans hat', path: './assets/images/deathmask/Womans hat.png' },
  { name: 'Wood', path: './assets/images/deathmask/Wood.png' },
  { name: 'Wrapped gift', path: './assets/images/deathmask/Wrapped gift.png' },
  { name: 'Yarn', path: './assets/images/deathmask/Yarn.png' },
];

function DeathMaskSection() {
  const [selectedImage, setSelectedImage] = useState('./assets/images/deathmask/Place Skull.png');
  const [userId, setUserId] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchDeathMask(user.id);
      }
    };
    getUser();
  }, []);

  const fetchDeathMask = async (userId) => {
    const { data, error } = await supabase
      .from('Tombs')
      .select('deathmask')
      .eq('user_id', userId)
      .single();

    if (data) {
      if (data.deathmask) {
        const selectedImage = images.find(img => img.name === data.deathmask);
        if (selectedImage) {
          setSelectedImage(selectedImage.path);
        }
      } else {
        setSelectedImage('./assets/images/deathmask/Place Skull.png');
      }
    } else if (error) {
      console.error('Error fetching deathmask:', error);
    }
  };

  const handleImageClick = async (image) => {
    setSelectedImage(image.path);

    if (userId) {
      const { data, error } = await supabase
        .from('Tombs')
        .update({ deathmask: image.name })
        .eq('user_id', userId);

      if (error) {
        console.error('Error saving image:', error);
      } else {
        console.log('Image saved successfully:', data);
      }
    }
    setSelectorVisible(false); // 이미지 선택 후 이미지 선택기 숨기기
  };

  return (
    <div className="death-mask-section p-4">
      <div className="coffin bg-grey-111 p-4 rounded-lg">
        <img
          src={selectedImage}
          alt="Selected"
          className="selected-image"
          onClick={() => setSelectorVisible(!selectorVisible)} // 클릭 시 이미지 선택기 표시/숨기기
        />
      </div>
      {selectorVisible && (
        <div className="image-selector">
          <div className="grid grid-cols-7 gap-2 mx-auto">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.path}
                alt={`Option ${image.name}`}
                onClick={() => handleImageClick(image)}
                className="option-image cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeathMaskSection;