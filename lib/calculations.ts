/**
 * 報酬計算ロジック
 * 仕様: 段階ごとに小数点以下を切り捨てる
 */
export function calculateReward(coins: number, rate: number, usdJpy: number): number {
  // 1. 今週累計コイン × キャスト報酬率
  // 2. 小数点以下切り捨て
  const step2 = Math.floor(coins * (rate / 100));
  
  // 3. ステップ2の結果 × 0.05
  // 4. 小数点以下切り捨て
  const step4 = Math.floor(step2 * 0.05);
  
  // 5. ステップ4の結果 × ドル円レート (整数)
  // 6. 最終報酬
  const finalReward = Math.floor(step4 * Math.floor(usdJpy));
  
  return finalReward;
}
