import { NextRequest, NextResponse } from 'next/server';

// DM送信ペーシング管理APIルート
// BANを回避するための送信頻度制御

// 設定値（将来的にはDB/環境変数で管理）
const PACING_CONFIG = {
  maxPerHour: 5,       // 1時間あたりの最大送信数
  maxPer24Hours: 25,   // 24時間あたりの最大送信数
  maxPerWeek: 100,     // 1週間あたりの最大送信数
  cooldownMinutes: 30, // 制限超過時のクールダウン時間
  // 推奨送信タイミング
  bestHours: [10, 11, 14, 15, 16], // 10-11時、14-16時
  bestDays: [1, 2, 3, 4], // 月-木（0=日, 1=月, ...）
};

// TODO: 実際のDB連携時は Supabase の dm_send_log テーブルから取得
let inMemorySendLog: { sent_at: Date }[] = [];

export async function GET() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const sentLastHour = inMemorySendLog.filter(
    (log) => log.sent_at > oneHourAgo
  ).length;
  const sentLast24h = inMemorySendLog.filter(
    (log) => log.sent_at > oneDayAgo
  ).length;
  const sentLastWeek = inMemorySendLog.filter(
    (log) => log.sent_at > oneWeekAgo
  ).length;

  // ペーシングステータス判定
  let status: 'OK' | 'WARNING' | 'STOP' = 'OK';
  let cooldownUntil: string | null = null;

  if (
    sentLastHour >= PACING_CONFIG.maxPerHour ||
    sentLast24h >= PACING_CONFIG.maxPer24Hours
  ) {
    status = 'STOP';
    const cooldownEnd = new Date(
      now.getTime() + PACING_CONFIG.cooldownMinutes * 60 * 1000
    );
    cooldownUntil = cooldownEnd.toISOString();
  } else if (
    sentLastHour >= PACING_CONFIG.maxPerHour * 0.8 ||
    sentLast24h >= PACING_CONFIG.maxPer24Hours * 0.8
  ) {
    status = 'WARNING';
  }

  // 最適送信タイミング判定
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  const isOptimalTime =
    PACING_CONFIG.bestHours.includes(currentHour) &&
    PACING_CONFIG.bestDays.includes(currentDay);

  // 次の最適タイミング
  let nextBestTime: string | null = null;
  if (!isOptimalTime) {
    const nextDate = new Date(now);
    for (let i = 0; i < 7 * 24; i++) {
      nextDate.setHours(nextDate.getHours() + 1);
      if (
        PACING_CONFIG.bestHours.includes(nextDate.getHours()) &&
        PACING_CONFIG.bestDays.includes(nextDate.getDay())
      ) {
        nextBestTime = nextDate.toISOString();
        break;
      }
    }
  }

  return NextResponse.json({
    status,
    sent_last_hour: sentLastHour,
    sent_last_24h: sentLast24h,
    sent_last_week: sentLastWeek,
    max_per_hour: PACING_CONFIG.maxPerHour,
    max_per_24h: PACING_CONFIG.maxPer24Hours,
    max_per_week: PACING_CONFIG.maxPerWeek,
    cooldown_until: cooldownUntil,
    cooldown_minutes: PACING_CONFIG.cooldownMinutes,
    is_optimal_time: isOptimalTime,
    next_best_time: nextBestTime,
    best_hours: PACING_CONFIG.bestHours,
    best_days: PACING_CONFIG.bestDays,
  });
}

// DM送信ログを記録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, message_id } = body;

    // 送信可否チェック
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const sentLastHour = inMemorySendLog.filter(
      (log) => log.sent_at > oneHourAgo
    ).length;
    const sentLast24h = inMemorySendLog.filter(
      (log) => log.sent_at > oneDayAgo
    ).length;

    if (
      sentLastHour >= PACING_CONFIG.maxPerHour ||
      sentLast24h >= PACING_CONFIG.maxPer24Hours
    ) {
      return NextResponse.json(
        {
          error: '送信制限に達しています。しばらく時間をおいてください。',
          cooldown_minutes: PACING_CONFIG.cooldownMinutes,
        },
        { status: 429 }
      );
    }

    // ログ記録
    inMemorySendLog.push({ sent_at: now });

    // TODO: Supabase連携時
    // await supabase.from('dm_send_log').insert({
    //   lead_id,
    //   message_id,
    //   sent_at: now.toISOString(),
    // });

    return NextResponse.json({
      success: true,
      remaining_this_hour: PACING_CONFIG.maxPerHour - sentLastHour - 1,
      remaining_today: PACING_CONFIG.maxPer24Hours - sentLast24h - 1,
    });
  } catch (error) {
    console.error('DM pacing log error:', error);
    return NextResponse.json(
      { error: 'ログ記録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
