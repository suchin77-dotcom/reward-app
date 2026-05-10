// components/CastDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { calculateReward } from '@/lib/calculations'; // 既存のロジックをインポート
import { Coins, RefreshCw, LogOut } from 'lucide-react';

export default function CastDashboard({ user, profile }: { user: any; profile: any }) {
  const [coins, setCoins] = useState<number>(0);
  const [rate, setRate] = useState<number>(150); // デフォルトレート
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  // 初期データ（現在のコイン数と最新レート）の取得
  useEffect(() => {
    const fetchData = async () => {
      // 1. コイン取得
      const { data: coinData } = await supabase
        .from('weekly_coins')
        .select('coins')
        .eq('user_id', user.id)
        .single();
      if (coinData) setCoins(coinData.coins);

      // 2. 最新レート取得（手動設定があればそれを優先）
      const { data: rateData } = await supabase
        .from('exchange_rates')
        .select('rate')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (rateData) setRate(rateData.rate);
    };
    fetchData();
  }, [user.id, supabase]);

  // 報酬計算（lib/calculations.ts のロジックを適用）
  const estimatedReward = calculateReward(coins, profile.reward_rate, rate);

  const handleUpdateCoins = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('weekly_coins')
      .upsert({ user_id: user.id, coins: coins, updated_at: new Date() });
    
    if (error) alert('更新に失敗しました');
    else alert('コイン数を更新しました');
    setIsUpdating(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* ログアウトボタン */}
      <div className="flex justify-end">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="text-gray-500 flex items-center gap-1 text-sm"
        >
          <LogOut size={16} /> ログアウト
        </button>
      </div>

      {/* 報酬目安表示（巨大表示） */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl text-center">
        <p className="text-indigo-100 text-sm mb-2">今週の報酬目安</p>
        <div className="text-5xl font-bold mb-2">
          ¥{estimatedReward.toLocaleString()}
        </div>
        <p className="text-xs text-indigo-200 opacity-80">
          1$ = {rate}円 / 報酬率 {(profile.reward_rate * 100).toFixed(0)}% で計算
        </p>
      </div>

      {/* コイン入力エリア */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <label className="block text-gray-700 text-sm font-bold mb-4 flex items-center gap-2">
          <Coins className="text-yellow-500" size={20} />
          今週の累計コイン
        </label>
        <input
          type="number"
          value={coins}
          onChange={(e) => setCoins(Number(e.target.value))}
          className="w-full text-3xl font-mono text-center border-2 border-gray-200 rounded-xl p-4 focus:border-indigo-500 focus:outline-none transition-all"
          placeholder="0"
        />
        <button
          onClick={handleUpdateCoins}
          disabled={isUpdating}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400"
        >
          {isUpdating ? <RefreshCw className="animate-spin" /> : 'コイン数を更新する'}
        </button>
      </div>

      <p className="text-center text-gray-400 text-xs px-4">
        ※この金額は確定報酬ではありません。週明けの精算時に変動する可能性があります。
      </p>
    </div>
  );
}
