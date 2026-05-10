// components/AdminDashboard.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { Settings, Users, LogOut } from 'lucide-react';

export default function AdminDashboard({ user }: { user: any }) {
  const supabase = createClient();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings /> 管理者パネル
        </h1>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="text-gray-500 flex items-center gap-1 text-sm"
        >
          <LogOut size={16} /> ログアウト
        </button>
      </div>

      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
        <Users size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">管理者画面は現在構築中です</h2>
        <p className="text-gray-500 mt-2">キャストの管理やレートの設定機能がここに追加されます。</p>
      </div>
    </div>
  );
}
