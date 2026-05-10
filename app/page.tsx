'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import CastDashboard from '../components/CastDashboard';
import AdminDashboard from '../components/AdminDashboard';
import LoginForm from '../components/LoginForm';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData?.status !== 'active' && profileData?.role !== 'admin') {
          await supabase.auth.signOut();
          alert('ログインが許可されていません。');
          setLoading(false);
          return;
        }
        setProfile(profileData);
      }
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginForm />;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {profile?.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <CastDashboard user={user} profile={profile} />
      )}
    </main>
  );
}
