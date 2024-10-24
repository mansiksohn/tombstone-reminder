import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import GroundSection from '../components/GroundSection';
import FlowerSection from '../components/FlowerSection';
import PublicHeader from '../components/PublicHeader'; // 공유 페이지용 헤더 컴포넌트 import
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import
import images from '../data/images'; // 공통 이미지 배열을 임포트

const SharePage = () => {
  const { userId } = useParams();
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('');
  const [goat, setGoat] = useState([]);
  const [obituary, setObituary] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');

useEffect(() => {
  const fetchTombstone = async () => {
    try {
      console.log(userId); // userId가 올바르게 출력되는지 확인

      const { data, error } = await supabase
        .from('Tombs')
        .select('user_name, tomb_name, goat, obituary, deathmask, birth_date, death_date') // 'flowers' 컬럼 제거
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching tombstone:', error);
        return;
      }

      if (data) {
          setUserName(data.user_name);
          setTombstoneName(data.tomb_name);
          setGoat(data.goat || []);
          setObituary(data.obituary);
          setSelectedImage(data.deathmask);
          setBirthDate(data.birth_date);
          setDeathDate(data.death_date);
        }
      } catch (error) {
        console.error('Error fetching tombstone:', error);
      }
    };

    if (userId) {
      fetchTombstone();
    }
  }, [userId]);

  if (!userName && !tombstoneName) {
    return <p>어? 묘비가 어디갔지?</p>;
  }

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
    <div className="home-container bg-real-black">
      <PublicHeader /> {/* PublicHeader 컴포넌트 추가 */}
      <main className="main-content text-center">
        <div className="username-container text-center text-xl">
          <span className="block">
            <span className="text-soul-green-500 font-bold underline">{userName || '신원미상'}</span>
            <span className="text-white">님</span>
            <span className="block pt-1">여기에 잠들다</span>
          </span>
        </div>
        <div className="date-container flex flex-col items-center"> {/* 날짜 영역 추가 */}
          <div className="flex items-center">
            <span className="date-input text-white">{birthDate || '????'}</span>
            <span className="date-separator mx-2 text-soul-green-500"> ~ </span>
            <span className="date-input text-white">{deathDate || '????'}</span>
          </div>
        </div>
        <div className="tombstone-container relative">
          <img src={process.env.PUBLIC_URL + '/assets/images/headstone.svg'} alt="Tombstone" className="tombstone-image w-full" />
          <div className="tombstone-name-overlay text-center">
            <h2 className="text-2xl tombstone-name filled-text">{tombstoneName}</h2>
          </div>
        </div>
        <FlowerSection />
        <GroundSection />
        <div className="death-mask-section p-4">
          <div className="coffin p-4 rounded-lg">
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
          <div className="obituary-section">
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
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="description underline"
                >
                  {item.description}
                </a>
              ) : (
                <span className="description">{item.description}</span>
              )}
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
