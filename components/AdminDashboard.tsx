'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { Users, Settings, DollarSign, History, RotateCcw, Edit, Save, X } from 'lucide-react';

export default function AdminDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'casts' | 'settings' | 'history'>('casts');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(154);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 1. 初期データの取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 全キャストのプロフィールとコイン情報を結合して取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          weekly_coins(coins)
        `)
        .order('display_name', { ascending: true });

      // 最新のレート取得
      const { data: rateData } = await supabase
        .from('exchange_rates')
        .select('rate')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (profileData) setProfiles(profileData);
      if (rateData) setExchangeRate(rateData.rate);
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // 2. ドル円レートの手動修正
  const updateExchangeRate = async (newRate: number) => {
    const { error } = await supabase.from('exchange_rates').insert({ rate: newRate });
    if (!error) {
      setExchangeRate(newRate);
      alert('レートを更新しました');
    }
  };

  // 3. 週次リセット機能（全キャストのコインを0にする）
  const handleManualReset = async () => {
    if (!confirm('全キャストの今週のコインをリセットしますか？この操作は取り消せません。')) return;
    
    // weekly_coins テーブルを全削除または一括更新
    const { error } = await supabase.from('weekly_coins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      alert('リセット完了しました');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* タブ切り替え（スマホでも押しやすいサイズ） */}
      <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border border-gray-100">
        <button onClick={() => setActiveTab('casts')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'casts' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
          <Users size={18} /> キャスト
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
          <Settings size={18} /> 設定
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
          <History size={18} /> 履歴
        </button>
      </div>

      {/* メインコンテンツ */}
      {activeTab === 'casts' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">在籍キャスト一覧</h3>
          {profiles.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                  <span className="font-bold text-lg">{p.display_name || '未設定'}</span>
                </div>
                <div className="text-sm text-gray-400">報酬率: {p.reward_rate * 100}% | コイン: {p.weekly_coins?.[0]?.coins || 0}</div>
              </div>
              <button className="p-2 bg-gray-50 rounded-full text-indigo-600"><Edit size={20} /></button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* レート修正 */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border">
            <h4 className="font-bold flex items-center gap-2 mb-4 text-gray-700"><DollarSign size={20} /> ドル円レート設定</h4>
            <div className="flex gap-4">
              <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(Number(e.target.value))} className="flex-1 text-2xl font-mono border-b-2 p-2 outline-none focus:border-indigo-500" />
              <button onClick={() => updateExchangeRate(exchangeRate)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">更新</button>
            </div>
          </div>

          {/* 手動リセット */}
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
            <h4 className="font-bold flex items-center gap-2 mb-2 text-red-700"><RotateCcw size={20} /> 週次リセット</h4>
            <p className="text-sm text-red-600 mb-4">全キャストのコイン情報を一括で削除します。月曜の朝などに手動で実行してください。</p>
            <button onClick={handleManualReset} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-100">今週のデータをリセット</button>
          </div>
        </div>
      )}
    </div>
  );
}
