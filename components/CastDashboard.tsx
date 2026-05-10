// components/CastDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { calculateReward } from '@/lib/calculations';
import { Coins, RefreshCw, LogOut, TrendingUp } from 'lucide-react';

export default function CastDashboard({ user, profile }: { user: any; profile: any }) {
  const [coins, setCoins] = useState<number>(0);
  const [rate, setRate] = useState<number>(150);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  // 初期データの取得
  useEffect(() => {
    const fetchData = async () => {
      // 1. 今週のコイン数を取得
      const { data: coinData } = await supabase
        .from('weekly_coins')
        .select('coins')
        .eq('user_id', user.id)
        .single();
      
      if (coinData) setCoins(coinData.coins);

      // 2. 最新の為替レートを取得
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

  // lib/calculations.ts のロジックで計算
  const estimatedReward = calculateReward(coins, profile.reward_rate, rate);

  const handleUpdateCoins = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('weekly_coins')
      .upsert({ 
        user_id: user.id, 
        coins: coins, 
        updated_at: new Date() 
      }, { onConflict: 'user_id' });
    
    if (error) {
      console.error(error);
      alert('更新に失敗しました。管理者にお問い合わせください。');
    } else {
      alert('コイン数を更新しました！');
    }
    setIsUpdating(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4">
      {/* ヘッダー・ログアウト */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-gray-800 font-bold flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" />
          マイレポート
        </h2>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs transition-colors"
        >
          <LogOut size={14} /> ログアウト
        </button>
      </div>

      {/* メイン報酬表示カード */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        <p className="text-indigo-100 text-sm font-medium mb-2">今週の報酬目安 (円)</p>
        <div className="text-6xl font-black tracking-tighter mb-4">
          <span className="text-3xl mr-1">¥</span>
          {estimatedReward.toLocaleString()}
        </div>
        <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs text-indigo-50 border border-white/20">
          1$ = {rate}円 / 報酬率 {(profile.reward_rate * 100).toFixed(0)}%
        </div>
      </div>

      {/* 入力フォームカード */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Coins className="text-yellow-600" size={24} />
          </div>
          <span className="text-gray-700 font-bold">獲得コインの入力</span>
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={coins === 0 ? '' : coins}
              onChange={(e) => setCoins(Number(e.target.value))}
              className="w-full text-5xl font-mono text-center border-b-4 border-gray-100 py-4 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-200"
              placeholder="0"
            />
            <div className="text-center text-xs text-gray-400 mt-2">現在の累計コインを入力してください</div>
          </div>

          <button
            onClick={handleUpdateCoins}
            disabled={isUpdating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-200 disabled:bg-gray-300 disabled:shadow-none"
          >
            {isUpdating ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <>
                <RefreshCw size={20} />
                データを更新する
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 text-center">
        <p className="text-gray-400 text-[10px] leading-relaxed">
          ※このアプリは報酬の目安を確認するためのものです。<br />
          実際の支払額は源泉徴収やシステム利用料等により変動します。
        </p>
      </div>
    </div>
  );
}
