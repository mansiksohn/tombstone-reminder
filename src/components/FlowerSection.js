import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

const FlowerSection = ({ userId, flowers, setFlowers }) => {
  const [canPlaceFlower, setCanPlaceFlower] = useState(true);

  const handlePlaceFlower = async () => {
    if (!canPlaceFlower) return;

    try {
      const newFlower = { user_id: userId, placed_at: new Date().toISOString() };

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
    <div>
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
    </div>
  );
};

export default FlowerSection;
