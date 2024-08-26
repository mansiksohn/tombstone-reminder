import React, { useState, useEffect, useRef, useCallback } from 'react';
import supabase from '../utils/supabaseClient';
import '../styles/obituary.scss';

function ObituarySection({ obituary, setObituary, handleSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    if (e.target.value.length <= 160) {
      setObituary(e.target.value);
    }
  };

  const handleSaveClick = useCallback(async () => {
    if (userId) {
      const { error } = await supabase
        .from('Tombs')
        .update({ obituary: obituary })
        .eq('user_id', userId);

      if (error) {
        console.error('Error saving obituary:', error);
      }
    }
    setIsEditing(false);
  }, [userId, obituary]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target)) {
        handleSaveClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleSaveClick]);

  const defaultObituary = '자신의 일생을 미리 부고로 작성하는 것은 현재와 미래를 성찰하는 유용한 방법이다. 우울해지는 부작용 없이 부고 쓰기를 해보는 방법은, 미래 시제로 자신의 이야기를 써보는 것이다.';

  return (
    <div className="obituary-section">
      <div className="obituary-container relative">
        {isEditing ? (
          <div className="flex flex-col items-end">
            <textarea
              ref={textareaRef}
              value={obituary || ''}
              onChange={handleChange}
              onBlur={handleSaveClick}
              onKeyPress={handleKeyPress}
              className="obituary-text-area border p-2 rounded-l text-black w-full"
              autoFocus
              maxLength={160}
              placeholder={defaultObituary}
            />
            <span className="char-count">{(obituary || '').length}/160</span>
          </div>
        ) : (
          <p onClick={handleClick} className="obituary-text cursor-pointer text-white">
            {obituary || '더 남기고 싶은 말이 있나요?'}
          </p>
        )}
      </div>
    </div>
  );
}

export default ObituarySection;
