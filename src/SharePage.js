import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from './supabaseClient';
import './App.css';

const SharePage = () => {
  const { userId } = useParams();
  const [tombstoneName, setTombstoneName] = useState('');
  const [flowers, setFlowers] = useState([]);
  const [canPlaceFlower, setCanPlaceFlower] = useState(true);

  useEffect(() => {
    const fetchTombstone = async () => {
      const { data, error } = await supabase
        .from('Tombs')
        .select('tomb_name, flowers')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching tombstone:', error);
        return;
      }

      setTombstoneName(data.tomb_name);
      setFlowers(data.flowers || []);
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

  return (
    <div className="app-container bg-white p-6">
      <header className="app-header text-xl font-bold">Tombstone Reminder</header>
      <main className="app-main mt-6 text-center">
        <div className="tombstone-container mt-6">
          <img src={process.env.PUBLIC_URL + '/headstone.png'} alt="Tombstone" className="tombstone-image w-full" />
          <div className="tombstone-name-overlay text-center mt-4">
            <h2 className="text-2xl font-semibold">{tombstoneName}</h2>
          </div>
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
      </main>
    </div>
  );
};

export default SharePage;
