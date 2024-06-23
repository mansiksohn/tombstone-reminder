import React from 'react';
import supabase from '../utils/supabaseClient';

function LogoutButton() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
