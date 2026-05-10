// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
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
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('ログインに失敗しました。メールアドレスまたはパスワードが正しくありません。');
      setLoading(false);
    } else {
      // 成功時は app/page.tsx の useEffect が検知して画面が切り替わります
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="text-indigo-600" size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">reward-app</h2>
          <p className="mt-2 text-sm text-gray-600">
            メールアドレスとパスワードでログインしてください
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Email</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="example@mail.com"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Password</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:bg-indigo-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'ログインする'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
