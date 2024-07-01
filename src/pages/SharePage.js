import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import GroundSection from '../components/GroundSection';
import FlowerSection from '../components/FlowerSection'; // 새 컴포넌트 import
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import
import images from '../data/images'; // 공통 이미지 배열을 임포트

const SharePage = () => {
  const { userId } = useParams();
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('');
  const [flowers, setFlowers] = useState([]);
  const [goat, setGoat] = useState([]);
  const [obituary, setObituary] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchTombstone = async () => {
      try {
        const { data, error } = await supabase
          .from('Tombs')
          .select('user_name, tomb_name, flowers, goat, obituary, deathmask')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching tombstone:', error);
          return;
        }

        if (data) {
          console.log('Fetched data:', data);
          setUserName(data.user_name);
          setTombstoneName(data.tomb_name);
          setFlowers(data.flowers || []);
          setGoat(data.goat || []);
          setObituary(data.obituary);
          setSelectedImage(data.deathmask);
        } else {
          console.error('No data found for the given user_id.');
        }
      } catch (error) {
        console.error('Error fetching tombstone:', error);
      }
    };

    fetchTombstone();
  }, [userId]);

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
    <div className="app-container bg-real-black">
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
          <img src={process.env.PUBLIC_URL + '/assets/images/headstone.svg'} alt="Tombstone" className="tombstone-image w-full" />
          <div className="tombstone-name-overlay text-center mt-4">
            <h2 className="text-2xl font-semibold">{tombstoneName}</h2>
          </div>
        </div>
        <FlowerSection userId={userId} flowers={flowers} setFlowers={setFlowers} />
        <GroundSection />
        <div className="death-mask-section p-4">
          <div className="coffin bg-grey-111 p-4 rounded-lg">
            <img
              src={
                images.find((img) => img.name === selectedImage)?.path ||
                process.env.PUBLIC_URL + '/assets/images/deathmask/Coffin.png'
              }
              alt="Selected"
              className="selected-image"
            />
          </div>
        </div>
        {obituary && (
          <div className="obituary-section mt-6">
            <div className="obituary-container bg-soul-green-950 p-4 rounded-lg min-h-60">
              <p className="obituary-text cursor-pointer text-white">{obituary}</p>
            </div>
          </div>
        )}
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
      </main>
    </div>
  );
};

export default SharePage;
