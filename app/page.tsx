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
    const initApp = async () => {
      // 1. セッション情報の確認
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setLoading(false);
        return;
      }

      setUser(authUser);

      // 2. プロフィール情報の取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileData) {
        // ステータスチェック
        if (profileData.status !== 'active' && profileData.role !== 'admin') {
          await supabase.auth.signOut();
          alert('ログインが許可されていません。');
          setUser(null);
        } else {
          setProfile(profileData);
        }
      }
      
      setLoading(false);
    };

    initApp();
  }, [supabase]);

  // 読み込み中はローディング画面で固定
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  // 読み込み完了後：ログインしていなければログインフォームへ
  if (!user) return <LoginForm />;

  // ログインしているがプロフィールがない場合の緊急避難
  if (!profile) {
    return (
      <div className="p-10 text-center">
        プロフィールが見つかりません。
        <button onClick={() => supabase.auth.signOut()} className="block mx-auto mt-4 underline">ログアウト</button>
      </div>
    );
  }

  // 全て揃ったらダッシュボードを表示
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {profile.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <CastDashboard user={user} profile={profile} />
      )}
    </main>
  );
}
