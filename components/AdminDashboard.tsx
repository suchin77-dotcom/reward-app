'use client';

import { createClient } from '../utils/supabase/client';
import { Settings, Users, LogOut } from 'lucide-react';

export default function AdminDashboard({ user }: { user: any }) {
  const supabase = createClient();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Settings className="text-indigo-600" />
          管理者パネル
        </h1>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm transition-colors"
        >
          <LogOut size={16} /> ログアウト
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ステータスカード */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <Users size={20} />
            </div>
            <h2 className="font-bold text-gray-700">システム状況</h2>
          </div>
          <p className="text-sm text-gray-500">
            現在、管理者としてログインしています。<br />
            詳細なキャスト管理機能は順次実装予定です。
          </p>
        </div>

        {/* 設定カード */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">クイックリンク</h2>
          <ul className="space-y-3">
            <li>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                className="text-indigo-600 hover:underline text-sm flex items-center gap-2"
              >
                Supabaseでデータを直接編集する
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
