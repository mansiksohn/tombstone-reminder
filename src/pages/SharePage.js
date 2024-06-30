import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import

const images = [
  { path: '/assets/images/image1.png', name: 'image1' },
  { path: '/assets/images/image2.png', name: 'image2' },
  { path: '/assets/images/image3.png', name: 'image3' },
  // 필요한 다른 이미지 경로와 이름을 추가하세요.
];

const SharePage = () => {
  const { userId } = useParams();
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('');
  const [flowers, setFlowers] = useState([]);
  const [goat, setGoat] = useState([]);
  const [obituary, setObituary] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [canPlaceFlower, setCanPlaceFlower] = useState(true);
  const [selectorVisible, setSelectorVisible] = useState(false);

  useEffect(() => {
    const fetchTombstone = async () => {
      const { data, error } = await supabase
        .from('Tombs')
        .select('user_name, tomb_name, flowers, goat, obituary, image')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching tombstone:', error);
        return;
      }

      setUserName(data.user_name);
      setTombstoneName(data.tomb_name);
      setFlowers(data.flowers || []);
      setGoat(data.goat || []);
      setObituary(data.obituary);
      setSelectedImage(data.image);
    };

    fetchTombstone();
  }, [userId]);

  const handlePlaceFlower = async () => {
    if (!canPlaceFlower) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to place a flower.');
        return;
      }

      const newFlower = { user_id: user.id, placed_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from('Tombs')
        .update({ flowers: [...flowers, newFlower] })
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Error placing flower:', error);
        return;
      }

      setFlowers(data[0].flowers);
      setCanPlaceFlower(false);

      setTimeout(() => {
        setCanPlaceFlower(true);
      }, 24 * 60 * 60 * 1000); // 24시간 후에 꽃을 다시 놓을 수 있도록 설정
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image.path);
    setSelectorVisible(false);
  };

  const getIconSrc = (link) => {
    if (link.includes('instagram.com')) {
      return '/assets/images/instagram.svg';
    } else if (link.includes('twitter.com') || link.includes('x.com')) {
      return '/assets/images/twitter.svg';
    } else if (link.includes('youtube.com')) {
      return '/assets/images/youtube.svg';
    }
    return '/assets/images/link-45deg.svg';
  };

  return (
    <div className="app-container bg-white p-6">
      <header className="app-header text-xl font-bold">
        <h2 className="text-2xl font-bold">
          <span className="block">
            <span className="text-soul-green-500 font-bold underline">{userName || '신원미상'}</span>
            <span className="text-black">님</span>
            <span className="block pt-2">여기에 잠들다</span>
          </span>
        </h2>
      </header>
      <main className="app-main mt-6 text-center">
        <div className="tombstone-container mt-6 relative">
          <img src={process.env.PUBLIC_URL + '/assets/images/headstone.png'} alt="Tombstone" className="tombstone-image w-full" />
          <div className="tombstone-name-overlay text-center mt-4">
            <h2 className="text-2xl font-semibold">{tombstoneName}</h2>
          </div>
        </div>
        <div className="death-mask-section p-4">
          <div className="coffin bg-grey-111 p-4 rounded-lg">
            <img
              src={selectedImage || process.env.PUBLIC_URL + '/assets/images/default-image.png'}
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
        <div className="flowers-section mt-6">
          {flowers.map((flower, index) => (
            <div key={index} className="flower">
              🌸 {/* 꽃 이모티콘 */}
            </div>
          ))}
        </div>
        <button onClick={handlePlaceFlower} className="bg-green-500 text-white p-2 rounded mt-2" disabled={!canPlaceFlower}>
          {canPlaceFlower ? 'Place a Flower' : 'You can place a flower once a day'}
        </button>
        <div className="goat-section mt-6">
          <h3 className="goat-title text-center text-xl font-bold">GOAT</h3>
          <span className="goat-subtitle">:: 최고의 순간 ::</span>
          {goat.map((item, index) => (
            <div key={index} className="goat-item flex items-center">
              <span className="tag">{item.tag}</span>
              <span className="description">{item.description}</span>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-soul-green-500">
                  <img src={process.env.PUBLIC_URL + getIconSrc(item.link)} alt="Link Icon" className="w-5 h-5 svg-icon" />
                </a>
              )}
            </div>
          ))}
        </div>
        <div className="obituary-section mt-6">
          <div className="obituary-container bg-soul-green-950 p-4 rounded-lg min-h-60">
            <p className="obituary-text cursor-pointer text-white">
              {obituary || '부고를 추가할까요?'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharePage;
