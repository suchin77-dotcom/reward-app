// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // 事前に作成済みのクライアント
import { useRouter } from 'next/navigation';
import CastDashboard from '../components/CastDashboard';
import AdminDashboard from '../components/AdminDashboard';
import LoginForm from '../components/LoginForm';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // プロフィール情報を取得（roleとstatusの確認）
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // ステータスチェック: 「在籍」以外はログアウト処理
        if (profileData?.status !== 'active' && profileData?.role !== 'admin') {
          await supabase.auth.signOut();
          alert('現在、このアカウントはログインが許可されていません。');
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 非ログイン時
  if (!user) {
    return <LoginForm />;
  }

  // ログイン後の条件分岐
  return (
    <main className="container mx-auto px-4 py-8">
      {profile?.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <CastDashboard user={user} profile={profile} />
      )}
    </main>
  );
}
