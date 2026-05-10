'use client';

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 【管理者用バックドア・ロジック】
    // 特定のメールアドレスの場合、未登録ならその場で登録(SignUp)を試みる
    if (email === "admin@system.test") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: '最高管理者' } }
      });
      // 既に登録済みでエラーが出ても無視してログインへ進む
    }

    // ログイン実行
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      alert('ログイン失敗: ' + signInError.message);
    } else {
      window.location.reload(); // 成功したらリロードしてダッシュボードへ
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 text-center">
        <h1 className="text-3xl font-black text-indigo-600 mb-2">Login</h1>
        <p className="text-gray-400 text-sm mb-8">管理用ID/パスを入力してください</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="メールアドレス" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 ring-indigo-500"
            required
          />
          <input 
            type="password" 
            placeholder="パスワード" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 p-5 rounded-2xl outline-none focus:ring-2 ring-indigo-500"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-100 flex justify-center items-center"
          >
            {loading ? '処理中...' : 'ログイン / 登録'}
          </button>
        </form>
        
        <p className="mt-6 text-xs text-gray-300">
          ※管理者用アドレスを入力すると自動でアカウントが作成されます。
        </p>
      </div>
    </div>
  );
}
