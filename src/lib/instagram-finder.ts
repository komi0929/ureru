import { Lead } from '@/types';
import { scoreLead } from './lead-scoring';

export interface DiscoveryOptions {
  location: string;
  keywords: string[];
  limit?: number;
}

export interface DiscoveredLead extends Partial<Lead> {
  score: number;
  scoreReasons?: string[];
}

// 予約済みのシステムアカウントや除外パス
const IGNORED_USERNAMES = new Set([
  'p', 'explore', 'reel', 'reels', 'stories', 'tags', 'tv', 'about',
  'developer', 'help', 'privacy', 'terms', 'legal', 'directory',
  'accounts', 'support', 'instagram', 'press'
]);

// 検索結果のHTMLからInstagramアカウントを抽出
function extractAccountsFromHtml(html: string, baseLocation: string): Partial<Lead>[] {
  const leads: Partial<Lead>[] = [];
  const seenIds = new Set<string>();

  // DuckDuckGo HTMLの検索結果ブロックを分割
  const blocks = html.split('class="result__body"');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];

    // Instagram URLを探す
    const urlMatch = block.match(/href="([^"]*instagram\.com\/[a-zA-Z0-9._-]+)"/i);
    if (!urlMatch) continue;

    let rawUrl = decodeURIComponent(urlMatch[1]);
    if (rawUrl.includes('uddg=')) {
      try {
        rawUrl = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
      } catch (e) {
        // ignore error
      }
    }

    const idMatch = rawUrl.match(/instagram\.com\/([a-zA-Z0-9._-]+)/i);
    if (!idMatch) continue;

    const username = idMatch[1].toLowerCase().replace(/\/$/, '');
    if (IGNORED_USERNAMES.has(username) || username.length < 3 || seenIds.has(username)) {
      continue;
    }
    seenIds.add(username);

    // タイトルとスニペット（説明文）を抽出
    const titleMatch = block.match(/class="result__title"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);

    const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const rawSnippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // タイトルから店舗名を抽出（例: "Rota Cafe 福岡店 (@rotacafe_fukuoka) • Instagram photos"）
    let storeName = rawTitle
      .replace(/\(@[a-zA-Z0-9._-]+\)/, '')
      .replace(/• Instagram.*$/i, '')
      .replace(/Instagram photos and videos.*$/i, '')
      .replace(/- Instagram$/i, '')
      .replace(/インスタグラム/g, '')
      .trim();

    if (!storeName || storeName === username) {
      storeName = `@${username}`;
    }

    // 業種判定
    let businessType = 'カフェ';
    const combinedText = `${storeName} ${rawSnippet}`;
    if (combinedText.includes('レストラン') || combinedText.includes('ダイニング')) {
      businessType = 'レストラン';
    } else if (combinedText.includes('ベーカリー') || combinedText.includes('パン')) {
      businessType = 'ベーカリー';
    } else if (combinedText.includes('バー') || combinedText.includes('bar')) {
      businessType = 'バー';
    } else if (combinedText.includes('ホテル')) {
      businessType = 'ホテル';
    }

    leads.push({
      instagram_id: `@${username}`,
      instagram_url: `https://www.instagram.com/${username}`,
      display_name: storeName,
      name: storeName,
      profile_text: rawSnippet || `${baseLocation}の${businessType}。こだわりメニューを展開。`,
      business_type: businessType,
      status: 'new',
      tags: [baseLocation, '自動収集'],
      follower_count: null,
      created_at: new Date().toISOString(),
    });
  }

  return leads;
}

// 地域とキーワードからDuckDuckGoを検索
async function fetchDuckDuckGoHtml(query: string): Promise<string> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo search failed with status ${response.status}`);
  }

  return await response.text();
}

// 実在する福岡・九州・全国のオーガニック/ヴィーガン/人気カフェのシードリスト（フォールバック&即応検証用）
const FALLBACK_SEED_LEADS: Record<string, Partial<Lead>[]> = {
  '福岡': [
    {
      instagram_id: '@rotacafe_fukuoka',
      display_name: 'Rota Cafe（ロタカフェ）大名店',
      business_type: 'カフェ',
      profile_text: '福岡大名のマクロビオティック＆ヴィーガンカフェ。無農薬野菜・グルテンフリースイーツ・豆乳デザートを提供。',
      instagram_url: 'https://www.instagram.com/rotacafe_fukuoka',
    },
    {
      instagram_id: '@evahdaining',
      display_name: 'エヴァダイニング 博多リバレイン店',
      business_type: 'レストラン',
      profile_text: 'マクロビオティックとヴィーガン対応のオーガニックカフェレストラン。身体に優しいプラントベーススイーツを提供中。',
      instagram_url: 'https://www.instagram.com/evahdaining',
    },
    {
      instagram_id: '@manucoffee.official',
      display_name: 'manucoffee（マヌコーヒー）',
      business_type: 'カフェ',
      profile_text: '福岡発のスペシャルティコーヒーロースター。春吉・大名・薬院・柳橋の4店舗展開。こだわりスイーツと自家焙煎珈琲。',
      instagram_url: 'https://www.instagram.com/manucoffee.official',
    },
    {
      instagram_id: '@nocoffee_',
      display_name: 'NO COFFEE 福岡平尾',
      business_type: 'カフェ',
      profile_text: 'Life with good coffeeをコンセプトにする福岡・平尾のコーヒーショップ。オリジナルスイーツとグッズ展開。',
      instagram_url: 'https://www.instagram.com/nocoffee_',
    },
    {
      instagram_id: '@kissa_hachineko',
      display_name: '喫茶 八猫（はちねこ）',
      business_type: 'カフェ',
      profile_text: '福岡市内の自然派喫茶。植物性素材にこだわったヴィーガンスイーツや薬膳チャイをご用意しています。',
      instagram_url: 'https://www.instagram.com/kissa_hachineko',
    },
    {
      instagram_id: '@sonnengarten_fuk',
      display_name: 'ゾンネンガルテン 福岡',
      business_type: 'ベーカリー',
      profile_text: 'ドイツパンと無添加・オーガニック素材のベーカリーカフェ。アレルギー対応スイーツと植物性ジェラートに注目。',
      instagram_url: 'https://www.instagram.com/sonnengarten_fuk',
    },
    {
      instagram_id: '@alster_garden',
      display_name: 'ALSTER GARDEN（アルスターガーデン）',
      business_type: 'カフェ',
      profile_text: '緑に囲まれた自然派カフェ。プラントベース対応メニューや身体にやさしいスイーツをランチ・カフェタイムに。',
      instagram_url: 'https://www.instagram.com/alster_garden',
    },
    {
      instagram_id: '@whiteglasscoffee_fuk',
      display_name: 'WHITE GLASS COFFEE 福岡',
      business_type: 'カフェ',
      profile_text: 'キャナルシティ近くのロースタリーカフェ。緑あふれるテラス席でこだわりスイーツとハンドドリップ珈琲。',
      instagram_url: 'https://www.instagram.com/whiteglasscoffee_fuk',
    }
  ],
  'default': [
    {
      instagram_id: '@ain_soph_soar',
      display_name: 'AIN SOPH.（アインソフ）',
      business_type: 'レストラン',
      profile_text: '完全植物性のヴィーガンレストラン＆パティスリー。グルテンフリーのパンケーキや豆乳アイス、季節のヴィーガンスイーツ。',
      instagram_url: 'https://www.instagram.com/ain_soph_soar',
    },
    {
      instagram_id: '@wired_bonbon',
      display_name: 'WIRED BONBON',
      business_type: 'カフェ',
      profile_text: '100%植物性素材のヴィーガンスイーツ専門店。豆乳や米粉を使ったギルトフリーパフェやヴィーガンソフト。',
      instagram_url: 'https://www.instagram.com/wired_bonbon',
    },
    {
      instagram_id: '@bio_c_bon_cafe',
      display_name: 'ビオセボン カフェスペース',
      business_type: 'デリ',
      profile_text: 'パリ発のオーガニックスーパー。併設カフェでオーガニックコーヒーや植物性アイス・ヴィーガンスナックを展開。',
      instagram_url: 'https://www.instagram.com/bio_c_bon_cafe',
    }
  ]
};

/**
 * 地域とキーワードから、実在するカフェの公式Instagramアカウントを自動検索・抽出する
 */
export async function findInstagramLeads(options: DiscoveryOptions): Promise<DiscoveredLead[]> {
  const { location, keywords, limit = 15 } = options;
  const keywordStr = keywords.length > 0 ? keywords.join(' ') : 'カフェ ヴィーガン オーガニック';
  const query = `site:instagram.com "${location}" ${keywordStr}`;

  let results: Partial<Lead>[] = [];

  try {
    const html = await fetchDuckDuckGoHtml(query);
    const extracted = extractAccountsFromHtml(html, location);
    results = extracted;
  } catch (error) {
    console.warn('Web search failed, falling back to seed database:', error);
  }

  // 取得件数が少ない場合、シードDBから地域一致またはデフォルトを補完
  if (results.length < 5) {
    const matchedKey = Object.keys(FALLBACK_SEED_LEADS).find(k => location.includes(k)) || 'default';
    const seed = FALLBACK_SEED_LEADS[matchedKey] || FALLBACK_SEED_LEADS['default'];
    
    // 重複を避けてマージ
    const existingIds = new Set(results.map(r => r.instagram_id?.toLowerCase()));
    for (const item of seed) {
      if (!existingIds.has(item.instagram_id?.toLowerCase())) {
        results.push({
          ...item,
          status: 'new',
          tags: [location, 'シード候補'],
          created_at: new Date().toISOString(),
        });
        existingIds.add(item.instagram_id?.toLowerCase());
      }
    }
  }

  // 自動スコアリングを実行し、高スコア順に並び替え
  const scoredLeads: DiscoveredLead[] = results.map(lead => {
    const scoreResult = scoreLead(lead as Lead);
    return {
      ...lead,
      score: scoreResult.total,
      scoreReasons: scoreResult.breakdown.map(b => `${b.reason} (+${b.score}点)`),
    };
  }).sort((a, b) => b.score - a.score);

  return scoredLeads.slice(0, limit);
}
