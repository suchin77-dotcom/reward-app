'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { Users, Settings, DollarSign, History, RotateCcw, Edit, Save, X, UserPlus, Trash2 } from 'lucide-react';

// 報酬率の選択肢
const REWARD_RATE_OPTIONS = [0.65, 0.70, 0.75, 0.80, 0.85];

export default function AdminDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'casts' | 'settings' | 'history'>('casts');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(154);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);

  // フォーム用ステート
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    reward_rate: 0.70,
    status: 'active'
  });

  const supabase = createClient();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: profileData } = await supabase
      .from('profiles')
      .select(`*, weekly_coins(coins)`)
      .order('created_at', { ascending: false });

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

  // キャスト登録・編集の保存
  const handleSaveCast = async () => {
    if (editingProfile) {
      // 既存キャストの編集
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          reward_rate: formData.reward_rate,
          status: formData.status
        })
        .eq('id', editingProfile.id);

      if (error) alert('修正に失敗しました');
    } else {
      // 新規キャスト登録 (Edge Functionsが未設定の場合は管理者によるAuth作成が必要)
      // 今回はシンプルに、Authの作成は別途行い、profilesへの紐付けを優先する形か
      // もしくは admin_user として登録用APIを叩く必要があります。
      alert('新規ユーザー作成にはAuth権限の管理設定が必要です。まずは既存の編集機能を優先します。');
    }
    setIsModalOpen(false);
    setEditingProfile(null);
    fetchInitialData();
  };

  const openEditModal = (p: any) => {
    setEditingProfile(p);
    setFormData({
      email: '', // パスワード等は編集不可にするのが一般的
      password: '',
      display_name: p.display_name,
      reward_rate: p.reward_rate,
      status: p.status
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* ヘッダー・タブ切り替え */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-800">Admin Console</h1>
        <button 
          onClick={() => { setEditingProfile(null); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border">
        <button onClick={() => setActiveTab('casts')} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'casts' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>キャスト</button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>設定</button>
      </div>

      {activeTab === 'casts' && (
        <div className="space-y-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                  <span className="font-bold text-lg">{p.display_name}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  報酬率: <span className="text-indigo-600 font-bold">{Math.round(p.reward_rate * 100)}%</span> | 
                  コイン: {p.weekly_coins?.[0]?.coins || 0}枚
                </div>
              </div>
              <button onClick={() => openEditModal(p)} className="p-2 bg-gray-50 rounded-full text-indigo-600"><Edit size={20} /></button>
            </div>
          ))}
        </div>
      )}

      {/* 登録・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingProfile ? 'キャスト編集' : '新規キャスト登録'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">キャスト名</label>
                <input type="text" value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500" placeholder="名前" />
              </div>

              {!editingProfile && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-400 ml-2">ログインID (Email)</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none" placeholder="example@mail.com" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 ml-2">パスワード</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none" placeholder="6文字以上" />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">報酬率設定</label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {REWARD_RATE_OPTIONS.map(val => (
                    <button 
                      key={val}
                      onClick={() => setFormData({...formData, reward_rate: val})}
                      className={`py-3 rounded-xl text-xs font-bold transition-all ${formData.reward_rate === val ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {Math.round(val * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">ステータス</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
                >
                  <option value="active">在籍 (Active)</option>
                  <option value="inactive">停止 (Inactive)</option>
                  <option value="resigned">除籍 (Resigned)</option>
                </select>
              </div>
            </div>

            <button onClick={handleSaveCast} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">
              {editingProfile ? '変更を保存する' : 'キャストを登録する'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
