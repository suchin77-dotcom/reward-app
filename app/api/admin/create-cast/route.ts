import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. 特権用クライアントの初期化 (Service Role Keyを使用)
  // ※環境変数はVercelの管理画面で設定します
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { email, password, display_name, reward_rate } = await request.json();

  // 2. Authにユーザーを登録
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name }
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // 3. プロフィール情報を profiles テーブルに挿入
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert([{
      id: authUser.user.id,
      display_name,
      reward_rate,
      role: 'cast',
      status: 'active'
    }]);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
