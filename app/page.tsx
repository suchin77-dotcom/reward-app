export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>報酬目安確認アプリ</h1>
      <p style={{ marginTop: '1rem', color: '#ccc' }}>
        システムを構築中です。まもなくログイン画面が表示されます。
      </p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        border: '1px solid #333', 
        borderRadius: '8px' 
      }}>
        <p>✅ データベース接続設定完了</p>
        <p>⏳ 画面作成中...</p>
      </div>
    </div>
  )
}
