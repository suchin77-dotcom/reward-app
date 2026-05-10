'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { calculateReward } from '../lib/calculations';
import { Coins, RefreshCw, LogOut, TrendingUp } from 'lucide-react';

export default function CastDashboard({ user, profile }: { user: any; profile: any }) {
  const [coins, setCoins] = useState<number>(0);
  const [rate, setRate] = useState<number>(150); // 初期値
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. weekly_coins の取得（データがない場合は coins=0 となる）
      const { data: coinData } = await supabase
        .from('weekly_coins')
        .select('coins')
        .eq('user_id', user.id)
        .maybeSingle(); // single() ではなく maybeSingle() を使うとデータ無しでもエラーにならない
      
      if (coinData) setCoins(coinData.coins);

      // 2. exchange_rates の取得
      const { data: rateData } = await supabase
        .from('exchange_rates')
        .select('rate')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (rateData) setRate(rateData.rate);
    };
    fetchData();
  }, [user.id, supabase]);

  // 【重要：修正ポイント】
  // profile や profile.reward_rate が存在するかチェックしてから計算する
  // 存在しない場合はとりあえず 0 を入れる
  const rewardRate = profile?.reward_rate ?? 0;
  const estimatedReward = calculateReward(coins, rewardRate, rate);

  const handleUpdateCoins = async () => {
    setIsUpdating(true);
    // upsert で更新。user_id が primary key または unique である必要があります
    const { error } = await supabase.from('weekly_coins').upsert({ 
      user_id: user.id, 
      coins: coins, 
      updated_at: new Date() 
    }, { onConflict: 'user_id' }); // user_id が重複したら更新する設定

    if (error) {
      alert('更新に失敗しました: ' + error.message);
    } else {
      alert('更新しました！');
    }
    setIsUpdating(false);
  };

  // profile が届くまでは何も出さない、あるいはローディングを出す
  if (!profile) return null;

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4 px-4">
      {/* ...省略（既存のUIコード）... */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-xl text-center">
        <p className="text-indigo-100 text-sm mb-2">今週の報酬目安 (円)</p>
        <div className="text-6xl font-black mb-4">¥{estimatedReward.toLocaleString()}</div>
        <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs">
          1$ = {rate}円 / {Math.round(rewardRate * 100)}%
        </div>
      </div>
      {/* ...残りの入力フォームなど... */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Coins className="text-yellow-600" size={24} />
          <span className="font-bold text-gray-700">コイン入力</span>
        </div>
        <input 
          type="number" 
          value={coins === 0 ? '' : coins} 
          onChange={(e) => setCoins(Number(e.target.value))} 
          className="w-full text-5xl font-mono text-center border-b-4 border-gray-100 py-4 focus:border-indigo-500 outline-none transition-all" 
          placeholder="0" 
        />
        <button 
          onClick={handleUpdateCoins} 
          disabled={isUpdating} 
          className="w-full mt-8 bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 flex justify-center items-center"
        >
          {isUpdating ? <RefreshCw className="animate-spin" /> : '更新する'}
        </button>
      </div>
    </div>
  );
}
