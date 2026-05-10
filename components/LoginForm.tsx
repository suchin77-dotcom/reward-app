'use client';

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('ログイン失敗。メールかパスワードが違います。');
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <LogIn className="mx-auto text-indigo-600 mb-2" size={40} />
          <h2 className="text-3xl font-black italic">reward-app</h2>
          <p className="text-sm text-gray-500 mt-2">ログインしてください</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="メールアドレス" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="パスワード" />
          {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin" /> : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
