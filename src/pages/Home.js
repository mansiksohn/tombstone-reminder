import React, { useState, useEffect } from 'react';
import '../styles/global.scss'; // 스타일 파일 경로 변경
import Login from './Login';
import OnboardingChat from '../pages/OnboardingChat';
import Header from '../components/Header';
import UserNameSection from '../components/UserNameSection';
import TombstoneSection from '../components/TombstoneSection';
import GroundSection from '../components/GroundSection';
import DeathMaskSection from '../components/DeathMaskSection'; // DeathMaskSection import 추가
import DatesSection from '../components/DatesSection';
import ObituarySection from '../components/ObituarySection';
import GoatSection from '../components/GoatSection';
import ShareSection from '../components/ShareSection';
import {
  getCurrentUserId,
  fetchIsOnboarded,
  fetchUserName,
  fetchTombstoneName,
  fetchBirthDate,
  fetchDeathDate,
  fetchObituary,
  fetchGoat,
  createShareLink,
  upsertUserNameToBackend,
  upsertTombstoneNameToBackend,
  upsertBirthDate,
  upsertDeathDate,
  upsertObituary,
  upsertGoat,
} from '../utils/supabaseService';
import supabase from '../utils/supabaseClient';

function Home() {
  const [localUser, setLocalUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('Your Name');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [obituary, setObituary] = useState('');
  const [goat, setGoat] = useState([]);
  const [newGoat, setNewGoat] = useState({ description: '', link: '' });
  const [editingGoatIndex, setEditingGoatIndex] = useState(-1);
  const [buttonText, setButtonText] = useState('Copy Link to Clipboard');
  const [buttonColor, setButtonColor] = useState('bg-green-500');
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setLocalUser(session ? session.user : null);
      if (!session) {
        setLoading(false); // 세션이 없을 때 로딩 상태를 해제
      }
    });
    const subscription = data?.subscription;
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        const is_onboarded = await fetchIsOnboarded(userId);
        setIsOnboarded(is_onboarded);
        if (is_onboarded) {
          const user_name = await fetchUserName(userId);
          const tombstone_name = await fetchTombstoneName(userId);
          const birth_date = await fetchBirthDate(userId);
          const death_date = await fetchDeathDate(userId);
          const fetchedObituary = await fetchObituary(userId);
          const fetchedGoat = await fetchGoat(userId);
          if (user_name) setUserName(user_name);
          if (tombstone_name) setTombstoneName(tombstone_name);
          setBirthDate(birth_date);
          setDeathDate(death_date);
          setObituary(fetchedObituary);
          setGoat(fetchedGoat);
        }
      }
      setLoading(false); // 데이터 로딩이 완료되면 로딩 상태를 해제
    };
    if (localUser) {
      loadUserData();
    }
  }, [localUser]);

  const handleCopyLink = async () => {
    try {
      const userId = await getCurrentUserId();
      const link = await createShareLink(userId);
      await navigator.clipboard.writeText(link);
      setButtonText('Link Copied');
      setButtonColor('bg-blue-500');
      setTimeout(() => {
        setButtonText('Copy Link to Clipboard');
        setButtonColor('bg-green-500');
      }, 1000);
    } catch (error) {
      console.error('Error creating or copying link:', error);
    }
  };

  const handleSave = async (field, value) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User is not logged in');
      switch (field) {
        case 'userName':
          await upsertUserNameToBackend(value, userId);
          setUserName(value);
          break;
        case 'tombstoneName':
          await upsertTombstoneNameToBackend(value, userId);
          setTombstoneName(value);
          break;
        case 'birthDate':
          await upsertBirthDate(value, userId);
          setBirthDate(value);
          break;
        case 'deathDate':
          await upsertDeathDate(value, userId);
          setDeathDate(value);
          break;
        case 'obituary':
          await upsertObituary(value, userId);
          setObituary(value);
          break;
        case 'goat':
          let updatedGoat = editingGoatIndex === -1 ? [...goat, newGoat] : goat.map((item, index) => index === editingGoatIndex ? newGoat : item);
          await upsertGoat(updatedGoat, userId);
          setGoat(updatedGoat);
          setNewGoat({ description: '', link: '' });
          setEditingGoatIndex(-1);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error saving ${field}:`, error);
    }
  };

  const handleDeleteGoat = async (index) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User is not logged in');
      const updatedGoat = goat.filter((_, i) => i !== index);
      await upsertGoat(updatedGoat, userId);
      setGoat(updatedGoat);
    } catch (error) {
      console.error('Error deleting goat:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    setIsOnboarded(true);
    const userId = await getCurrentUserId();
    const user_name = await fetchUserName(userId);
    const tombstone_name = await fetchTombstoneName(userId);
    const fetchedObituary = await fetchObituary(userId);
    const fetchedGoat = await fetchGoat(userId);
    const birth_date = await fetchBirthDate(userId);
    const death_date = await fetchDeathDate(userId);
    if (user_name) setUserName(user_name);
    if (tombstone_name) setTombstoneName(tombstone_name);
    setObituary(fetchedObituary);
    setGoat(fetchedGoat);
    setBirthDate(birth_date);
    setDeathDate(death_date);
  };

  if (loading) return <div className="loading">Loading...</div>; // 로딩 상태 표시
  if (!localUser) return <Login />;
  if (!isOnboarded) return <OnboardingChat onOnboardingComplete={handleOnboardingComplete} />;

  return (
    <div className="home-container">
      <Header userName={userName} /> {/* userName prop 추가 */}
      <main className="main-content">
        <UserNameSection userName={userName} setUserName={setUserName} handleSave={handleSave} />
        <DatesSection birthDate={birthDate} deathDate={deathDate} setBirthDate={setBirthDate} setDeathDate={setDeathDate} handleSave={handleSave} />
        <TombstoneSection tombstoneName={tombstoneName} setTombstoneName={setTombstoneName} handleSave={handleSave} />
        <GroundSection /> {/* GroundSection을 Home에서 렌더링 */}
        <DeathMaskSection /> {/* DeathMaskSection 추가 */}
        <ObituarySection obituary={obituary} setObituary={setObituary} handleSave={handleSave} />
        <GoatSection goat={goat} setGoat={setGoat} newGoat={newGoat} setNewGoat={setNewGoat} handleSave={handleSave} handleEditGoat={setEditingGoatIndex} handleDeleteGoat={handleDeleteGoat} />
        <ShareSection handleCopyLink={handleCopyLink} buttonText={buttonText} buttonColor={buttonColor} />
      </main>
    </div>
  );
}

export default Home;
