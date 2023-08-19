import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared'
import supabase from './supabaseClient';

function Login() {
    return (
        <div className="login-container">
            <img src={process.env.PUBLIC_URL + '/headstone.png'} alt="Tombstone" className="tombstone-image" />
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google']}
                    theme="dark"
                    onlyThirdPartyProviders
                />
        </div>            
    );
}
  
export default Login;
