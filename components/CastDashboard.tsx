'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { calculateReward } from '../lib/calculations';
import { Coins, RefreshCw, LogOut, TrendingUp } from 'lucide-react';

export default function CastDashboard({ user, profile }: { user: any; profile: any }) {
  const [coins, setCoins] = useState<number>(0);
  const [rate, setRate] = useState<number>(150);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: coinData } = await supabase.from('weekly_coins').select('coins').eq('user_id', user.id).single();
      if (coinData) setCoins(coinData.coins);
      const { data: rateData } = await supabase.from('exchange_rates').select('rate').order('created_at', { ascending: false }).limit(1).single();
      if (rateData) setRate(rateData.rate);
    };
    fetchData();
  }, [user.id, supabase]);

  const estimatedReward = calculateReward(coins, profile.reward_rate, rate);

  const handleUpdateCoins = async () => {
    setIsUpdating(true);
    await supabase.from('weekly_coins').upsert({ user_id: user.id, coins: coins, updated_at: new Date() });
    alert('更新しました！');
    setIsUpdating(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4 px-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2"><TrendingUp size={20} className="text-indigo-600" />マイレポート</h2>
        <button onClick={() => supabase.auth.signOut()} className="text-gray-400 flex items-center gap-1 text-xs"><LogOut size={14} /> ログアウト</button>
      </div>
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-xl text-center">
        <p className="text-indigo-100 text-sm mb-2">今週の報酬目安 (円)</p>
        <div className="text-6xl font-black mb-4">¥{estimatedReward.toLocaleString()}</div>
        <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs">1$ = {rate}円 / {(profile.reward_rate * 100).toFixed(0)}%</div>
      </div>
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6"><Coins className="text-yellow-600" size={24} /><span className="font-bold text-gray-700">コイン入力</span></div>
        <input type="number" value={coins === 0 ? '' : coins} onChange={(e) => setCoins(Number(e.target.value))} className="w-full text-5xl font-mono text-center border-b-4 border-gray-100 py-4 focus:border-indigo-500 outline-none transition-all" placeholder="0" />
        <button onClick={handleUpdateCoins} disabled={isUpdating} className="w-full mt-8 bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200">
          {isUpdating ? <RefreshCw className="animate-spin" /> : '更新する'}
        </button>
      </div>
    </div>
  );
}
