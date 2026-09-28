import { Lead } from '@/types';

export interface ScoreBreakdown {
  reason: string;
  score: number;
}

export interface LeadScore {
  total: number;
  breakdown: ScoreBreakdown[];
}

export function scoreLead(lead: Lead): LeadScore {
  let total = 0;
  const breakdown: ScoreBreakdown[] = [];

  // Followers
  if (lead.followers_count && lead.followers_count >= 10000) {
    total += 40;
    breakdown.push({ reason: 'フォロワー1万人以上', score: 40 });
  } else if (lead.followers_count && lead.followers_count >= 3000) {
    total += 20;
    breakdown.push({ reason: 'フォロワー3000人以上', score: 20 });
  } else {
    total += 10;
    breakdown.push({ reason: 'フォロワー3000人未満', score: 10 });
  }

  // Profile keywords
  const profile = (lead.profile_text || '').toLowerCase();
  if (profile.includes('ヴィーガン') || profile.includes('vegan') || profile.includes('プラントベース')) {
    total += 30;
    breakdown.push({ reason: 'ヴィーガン関連キーワード', score: 30 });
  }
  if (profile.includes('オーガニック') || profile.includes('organic') || profile.includes('無添加') || profile.includes('天然')) {
    total += 20;
    breakdown.push({ reason: 'オーガニック関連キーワード', score: 20 });
  }

  // Business type
  if (lead.business_type === 'カフェ' || lead.business_type === 'レストラン' || lead.business_type === 'ホテル') {
    total += 10;
    breakdown.push({ reason: `ターゲット業種（${lead.business_type}）`, score: 10 });
  }

  total = Math.min(total, 100);

  return { total, breakdown };
}

export function scoreLeads(leads: Lead[]): (Lead & { scoreData: LeadScore })[] {
  return leads.map(l => ({ ...l, scoreData: scoreLead(l) })).sort((a, b) => b.scoreData.total - a.scoreData.total);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (score >= 30) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getScoreEmoji(score: number): string {
  if (score >= 80) return '🔥';
  if (score >= 50) return '⭐';
  if (score >= 30) return '📋';
  return '❄️';
}
