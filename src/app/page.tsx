import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginPanel from '@/components/LoginPanel';

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/me');

  return <LoginPanel />;
}
