import supabase from './supabaseClient';

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error);
  } else {
    console.log('Logged out successfully');
  }
};
