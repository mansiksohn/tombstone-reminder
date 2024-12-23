import { useState, useEffect } from 'react';
import supabase from './supabaseClient';
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
} from './supabaseService';

const useUserData = () => {
  const [localUser, setLocalUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [obituary, setObituary] = useState('');
  const [goat, setGoat] = useState([]);
  const [newGoat, setNewGoat] = useState({ tag: '', description: '', link: '' });
  const [loading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState('공유할 페이지 열기 >');
  const [buttonColor, setButtonColor] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setLocalUser(session ? session.user : null);
      if (!session) {
        setLoading(false);
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
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const userId = await getCurrentUserId();
        if (!userId || !isMounted) return;

        const [
          is_onboarded,
          user_name,
          tombstone_name,
          birth_date,
          death_date,
          fetchedObituary,
          fetchedGoat,
        ] = await Promise.all([
          fetchIsOnboarded(userId),
          fetchUserName(userId),
          fetchTombstoneName(userId),
          fetchBirthDate(userId),
          fetchDeathDate(userId),
          fetchObituary(userId),
          fetchGoat(userId),
        ]);

        if (isMounted) {
          setIsOnboarded(is_onboarded);
          setUserName(user_name || '');
          setTombstoneName(tombstone_name || '');
          setBirthDate(birth_date || '');
          setDeathDate(death_date || '');
          setObituary(fetchedObituary || '');
          setGoat(fetchedGoat || []);
        }

        // Link 생성
        const generatedLink = await createShareLink(userId);
        setLink(generatedLink);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (localUser) {
      loadUserData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [localUser]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setButtonText('Link Copied');
      setButtonColor('bg-soul-green-900');
      setTimeout(() => {
        setButtonText('공유페이지 열기');
        setButtonColor('bg-soul-green-500');
      }, 1000);
    } catch (error) {
      console.error('Error copying link:', error);
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
          let updatedGoat = Array.isArray(goat) ? [...goat, value] : [value];
          await upsertGoat(updatedGoat, userId);
          setGoat(updatedGoat);
          setNewGoat({ tag: '', description: '', link: '' });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error saving ${field}:`, error);
    }
  };

  const handleEditGoat = async (index, updatedGoatItem) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User is not logged in');
      const updatedGoat = goat.map((item, i) => (i === index ? updatedGoatItem : item));
      await upsertGoat(updatedGoat, userId);
      setGoat(updatedGoat);
    } catch (error) {
      console.error('Error updating goat:', error);
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

  return {
    localUser,
    isOnboarded,
    userName,
    tombstoneName,
    birthDate,
    deathDate,
    obituary,
    goat,
    newGoat,
    loading,
    buttonText,
    buttonColor,
    link,
    setUserName,
    setTombstoneName,
    setBirthDate,
    setDeathDate,
    setObituary,
    setGoat,
    setNewGoat,
    handleCopyLink,
    handleSave,
    handleEditGoat,
    handleDeleteGoat,
    handleOnboardingComplete,
  };
};

export default useUserData;
