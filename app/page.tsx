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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Profile fetch error:", error);
        }

        // ステータスチェックのガード
        if (profileData && profileData.status !== 'active' && profileData.role !== 'admin') {
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

  // 1. ローディング中の表示
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
          <p>データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // 2. ログインしていない場合
  if (!user) return <LoginForm />;

  // 3. ログインはしているが、Profileが取れていない場合（ここが真っ白の原因！）
  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 text-red-600 p-4 text-center">
        <div>
          <p className="font-bold">プロフィールが見つかりません</p>
          <p className="text-sm">Supabaseのprofilesテーブルに、あなたのID（{user.id}）のデータがあるか確認してください。</p>
          <button onClick={() => supabase.auth.signOut()} className="mt-4 underline">ログアウトしてやり直す</button>
        </div>
      </div>
    );
  }

  // 4. 正常な表示
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
