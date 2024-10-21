import React, { useState, useEffect, useRef } from 'react';
import supabase from '../utils/supabaseClient'; // default import 사용
import '../styles/DeathMaskSection.scss';
import images from '../data/images'; // 공통 이미지 배열을 임포트

function DeathMaskSection() {
  const [selectedImage, setSelectedImage] = useState('/assets/images/deathmask/Place Skull.png');
  const [userId, setUserId] = useState(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const selectorRef = useRef(null); // 팝업을 참조하기 위한 ref 생성

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

  useEffect(() => {
    // 외부 클릭 감지 핸들러
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setSelectorVisible(false);
      }
    };

    // 이벤트 리스너 추가
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 이벤트 리스너 제거
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
        setSelectedImage('/assets/images/deathmask/Place Skull.png');
      }
    } else if (error) {
      console.error('Error fetching deathmask:', error);
    }
  };

  const handleImageClick = async (image) => {
    setSelectedImage(image.path);
  
    if (userId) {
      const { error } = await supabase
        .from('Tombs')
        .update({ deathmask: image.name })
        .eq('user_id', userId);
  
      if (error) {
        console.error('Error saving image:', error);
      }
    }
    setSelectorVisible(false); // 이미지 선택 후 이미지 선택기 숨기기
  };

  return (
    <div className="death-mask-section p-4">
      <div className="coffin p-4 rounded-lg">
        <img
          src={selectedImage}
          alt="Selected"
          className="selected-image"
          onClick={() => setSelectorVisible(!selectorVisible)} // 클릭 시 이미지 선택기 표시/숨기기
        />
      </div>
      {selectorVisible && (
        <div className="image-selector" ref={selectorRef}>
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
