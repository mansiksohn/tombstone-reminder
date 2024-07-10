import supabase from './supabaseClient';

export const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
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
  const { error } = await supabase
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
