import React, { useState, useEffect } from 'react';
import '../styles/global.scss'; // 스타일 파일 경로 변경
import Login from './Login';
import OnboardingChat from '../pages/OnboardingChat';
import Header from '../components/Header';
import UserNameSection from '../components/UserNameSection';
import TombstoneSection from '../components/TombstoneSection';
import GroundSection from '../components/GroundSection';
import DeathMaskSection from '../components/DeathMaskSection';
import DatesSection from '../components/DatesSection';
import ObituarySection from '../components/ObituarySection';
import GoatSection from '../components/GoatSection';
import ShareSection from '../components/ShareSection';
import useUserData from '../utils/useUserData';
import supabase from '../utils/supabaseClient';

function Home() {
  const {
    localUser,
    userId,  // userId 추가
    isOnboarded,
    userName,
    tombstoneName,
    birthDate,
    deathDate,
    obituary,
    goat,
    newGoat,
    buttonText,
    buttonColor,
    loading,
    setUserName,
    setTombstoneName,
    setBirthDate,
    setDeathDate,
    setObituary,
    setGoat,
    setNewGoat,
    handleCopyLink,
    handleSave,
    handleDeleteGoat,
    handleOnboardingComplete,
  } = useUserData();

  if (loading) return <div className="loading">Loading...</div>; // 로딩 상태 표시
  if (!localUser) return <Login />;
  if (!isOnboarded) return <OnboardingChat onOnboardingComplete={handleOnboardingComplete} />;

  return (
    <div className="home-container">
      <Header userName={userName} />
      <main className="main-content">
        <UserNameSection userName={userName} setUserName={setUserName} handleSave={handleSave} />
        <DatesSection birthDate={birthDate} deathDate={deathDate} setBirthDate={setBirthDate} setDeathDate={setDeathDate} handleSave={handleSave} />
        <TombstoneSection tombstoneName={tombstoneName} setTombstoneName={setTombstoneName} handleSave={handleSave} />
        <GroundSection />
        <DeathMaskSection />
        <ObituarySection obituary={obituary} setObituary={setObituary} handleSave={handleSave} />
        <GoatSection
          userId={userId}  // userId 전달
          goat={goat}
          setGoat={setGoat}
          newGoat={newGoat}
          setNewGoat={setNewGoat}
          handleSave={handleSave}
          handleDeleteGoat={handleDeleteGoat}
        />
        <ShareSection handleCopyLink={handleCopyLink} buttonText={buttonText} buttonColor={buttonColor} />
      </main>
    </div>
  );
}

export default Home;
