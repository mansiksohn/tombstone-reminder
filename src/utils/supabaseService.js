import supabase from './supabaseClient';

export const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    alert('Error fetching user: ' + error.message);  // 사용자에게 에러 알림 추가
    return null;
  }
  return user ? user.id : null;
};

const fetchSingleValue = async (userId, column) => {
  const { data, error } = await supabase
    .from('Tombs')
    .select(column)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error(`Error fetching ${column}:`, error);
    return null;
  }

  return data[column];
};

export const fetchIsOnboarded = async (userId) => fetchSingleValue(userId, 'is_onboarded');
export const fetchUserName = async (userId) => fetchSingleValue(userId, 'user_name');
export const fetchTombstoneName = async (userId) => fetchSingleValue(userId, 'tomb_name');
export const fetchObituary = async (userId) => fetchSingleValue(userId, 'obituary');
export const fetchGoat = async (userId) => fetchSingleValue(userId, 'goat');
export const fetchBirthDate = async (userId) => fetchSingleValue(userId, 'birth_date');
export const fetchDeathDate = async (userId) => fetchSingleValue(userId, 'death_date');

const upsertSingleValue = async (userId, values) => {
  const { error } = await supabase
    .from('Tombs')
    .upsert({ user_id: userId, ...values, is_onboarded: true }, { onConflict: ['user_id'] });

  if (error) {
    console.error(`Error upserting ${Object.keys(values)[0]}:`, error);
    return null;
  }

  return true;
};

export const upsertTombstoneNameToBackend = async (tombName, userId) => upsertSingleValue(userId, { tomb_name: tombName });
export const upsertUserNameToBackend = async (userName, userId) => upsertSingleValue(userId, { user_name: userName });
export const upsertObituary = async (obituary, userId) => upsertSingleValue(userId, { obituary });
export const upsertGoat = async (goat, userId) => upsertSingleValue(userId, { goat });
export const upsertBirthDate = async (birthDate, userId) => upsertSingleValue(userId, { birth_date: birthDate });
export const upsertDeathDate = async (deathDate, userId) => upsertSingleValue(userId, { death_date: deathDate });

export const createShareLink = async (userId) => {
  const { data, error } = await supabase
    .from('Tombs')
    .select('tomb_name')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error creating share link:', error);
    return null;
  }

  return `${window.location.origin}/share/${userId}`;
};

export const deleteAccount = async (userId) => {
  try {
    // Tombs 테이블에서 유저 데이터를 삭제
    const { error: tombsError } = await supabase
      .from('Tombs')
      .delete()
      .eq('user_id', userId);

    if (tombsError) {
      console.error('Error deleting user data from Tombs:', tombsError);
      return false;
    }

    // 계정 삭제 (Supabase 인증 계정 삭제)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting user from Supabase auth:', authError);
      return false;
    }

    return true; // 삭제 성공
  } catch (error) {
    console.error('Error deleting account:', error);
    return false;
  }
};