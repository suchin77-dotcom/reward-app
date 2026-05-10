'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import CastDashboard from '../components/CastDashboard';
import AdminDashboard from '../components/AdminDashboard';
import LoginForm from '../components/LoginForm';
import { Loader2 } from 'lucide-react';

// 【誰でも管理者になれる魔法のログイン情報】
// これを LoginForm で入力するだけで、DBをいじらずに管理者になれます。
const MASTER_ADMIN_EMAIL = "admin@system.test";
const MASTER_ADMIN_PASS = "master7788";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initApp = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setLoading(false);
        return;
      }

      setUser(authUser);

      // プロフィール取得を試みる
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // 管理者アドレスでログインしている場合、プロフィールがなくても強制的にadminにする
      if (authUser.email === MASTER_ADMIN_EMAIL) {
        setProfile({
          id: authUser.id,
          role: 'admin',
          display_name: '最高管理者',
          status: 'active',
          reward_rate: 1.0
        });
      } else {
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    initApp();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ログインしていない場合
  if (!user) {
    return (
      <LoginForm 
        // LoginForm側で「もし特定のメールならサインアップも同時に行う」ような
        // 処理があるとより完璧ですが、まずは既存のフォームで上記アドレスで試してください。
        // もし「User not found」が出る場合は、一度だけSignUp(登録)ボタンを押せば、
        // 次からはこのロジックで強制的に管理者になります。
      />
    );
  }

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
