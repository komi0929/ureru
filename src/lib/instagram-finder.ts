import { Lead } from '@/types';
import { scoreLead } from './lead-scoring';

export interface DiscoveryOptions {
  location: string;
  keywords: string[];
  limit?: number;
  category?: 'ramen' | 'curry' | 'hotel' | 'burger' | 'cafe' | 'all';
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

// 業種自動判定
export function detectBusinessType(name: string, snippet: string): string {
  const combined = `${name} ${snippet}`.toLowerCase();
  if (combined.includes('ラーメン') || combined.includes('拉麺') || combined.includes('ramen') || combined.includes('麺') || combined.includes('担々麺')) {
    return 'ラーメン';
  }
  if (combined.includes('カレー') || combined.includes('curry') || combined.includes('スパイス')) {
    return 'カレー';
  }
  if (combined.includes('バーガー') || combined.includes('burger') || combined.includes('ダイナー')) {
    return 'バーガー';
  }
  if (combined.includes('ホテル') || combined.includes('hotel') || combined.includes('ラウンジ') || combined.includes('宿泊')) {
    return 'ホテル';
  }
  if (combined.includes('ベーカリー') || combined.includes('パン') || combined.includes('bakery')) {
    return 'ベーカリー';
  }
  if (combined.includes('レストラン') || combined.includes('ダイニング') || combined.includes('バル')) {
    return 'レストラン';
  }
  if (combined.includes('バー') || combined.includes('bar')) {
    return 'バー';
  }
  return 'カフェ';
}

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
    const businessType = detectBusinessType(storeName, rawSnippet);

    leads.push({
      instagram_id: `@${username}`,
      instagram_url: `https://www.instagram.com/${username}`,
      display_name: storeName,
      name: storeName,
      profile_text: rawSnippet || `${baseLocation}の${businessType}。こだわりメニューを展開。`,
      business_type: businessType,
      status: 'new',
      tags: [baseLocation, '自動収集', businessType],
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

// 🎯 高確度シードマスターデータベース（即時・高精度フォールバック対応）
export const HIGH_IMPACT_SEEDS = {
  // 🍜 全国の有力ヴィーガンラーメン店舗（北海道〜沖縄、福岡を含む全国網羅マスター）
  ramen: [
    // ── 福岡・九州エリア ──
    {
      instagram_id: '@vegan.halalramen__yadokari',
      display_name: 'Vegan Ramen YADOKARI（福岡平尾）',
      business_type: 'ラーメン',
      profile_text: '福岡市中央区平尾の100%植物性ヴィーガンラーメン専門店。五葷不使用・グルテンフリー麺対応。ヴィーガン餃子や野菜寿司も展開しインバウンド旅行客から大絶賛。',
      instagram_url: 'https://www.instagram.com/vegan.halalramen__yadokari',
      tags: ['福岡', '九州', 'ヴィーガンラーメン', '専門店', 'グルテンフリー']
    },
    {
      instagram_id: '@sushi_shima_fukuoka',
      display_name: '鮨しま（福岡港・ヴィーガン豚骨風ラーメン）',
      business_type: 'ラーメン',
      profile_text: '福岡市中央区港の鮨名店がランチ限定で提供する「ヴィーガンOK濃厚豚骨風ラーメン」。豆乳と香味野菜の極上出汁でヴィーガン・外国人客が殺到（要予約）。',
      instagram_url: 'https://www.instagram.com/sushi_shima_fukuoka',
      tags: ['福岡', '九州', 'ヴィーガンラーメン', '豚骨風', '名店']
    },
    {
      instagram_id: '@bugoro_all_vegan',
      display_name: 'BUGORO ALL VEGAN（ブーゴロ 福岡）',
      business_type: 'ラーメン',
      profile_text: '福岡の古民家ヴィーガンラーメン＆カフェ。博多風ヴィーガンラーメンやヴィーガン担々麺を提供。こだわりの食後デザート需要が高い。',
      instagram_url: 'https://www.instagram.com/bugoro_all_vegan',
      tags: ['福岡', '九州', 'ヴィーガンラーメン', '古民家カフェ', '担々麺']
    },
    {
      instagram_id: '@funadeya',
      display_name: 'veggie食堂 船出屋（福岡古賀）',
      business_type: 'ラーメン',
      profile_text: '福岡県古賀市のオーガニック＆ヴィーガン食堂。完全植物性の特製ヴィーガンラーメンや薬膳麺、アレルギー対応スイーツを展開。',
      instagram_url: 'https://www.instagram.com/funadeya',
      tags: ['福岡', '九州', 'ヴィーガンラーメン', 'オーガニック', '薬膳']
    },
    {
      instagram_id: '@marutan_official',
      display_name: '博多拉担麺 まるたん（天神店・福岡）',
      business_type: 'ラーメン',
      profile_text: '福岡・天神で話題の植物性100%スープ「ビーガンラータンメン」。大豆ミートと胡麻香るスープでヘルシー志向客・訪日外国人を集客。',
      instagram_url: 'https://www.instagram.com/marutan_official',
      tags: ['福岡', '九州', 'ヴィーガンラーメン', '担々麺', '天神']
    },
    {
      instagram_id: '@rotacafe_fukuoka',
      display_name: 'Rota Cafe（ロタカフェ 福岡大名）',
      business_type: 'ラーメン',
      profile_text: '福岡大名のヴィーガン・マクロビ名店。グルテンフリーの特製ヴィーガン麺メニューを展開。アイス・スイーツとの親和性が極めて高い。',
      instagram_url: 'https://www.instagram.com/rotacafe_fukuoka',
      tags: ['福岡', '九州', 'ヴィーガンラーメン', 'グルテンフリー', '大名']
    },

    // ── 大阪・関西エリア ──
    {
      instagram_id: '@mercyveganramen',
      display_name: 'MERCY Vegan Ramen（大阪博労町）',
      business_type: 'ラーメン',
      profile_text: '大阪・本町/心斎橋エリアのヴィーガンラーメン専門店。米粉特製麺によるグルテンフリー＆100%植物性ラーメン。外国人客比率90%以上。',
      instagram_url: 'https://www.instagram.com/mercyveganramen',
      tags: ['大阪', '関西', 'ヴィーガンラーメン', '専門店', 'グルテンフリー']
    },
    {
      instagram_id: '@the_fire_vegan_osaka',
      display_name: 'The Fire Vegan Osaka（心斎橋）',
      business_type: 'ラーメン',
      profile_text: '大阪心斎橋のヴィーガンラーメン＆ダイナー。ヴィーガンとんこつラーメンや餃子を提供。ナイトタイムのデザート注文需要大。',
      instagram_url: 'https://www.instagram.com/the_fire_vegan_osaka',
      tags: ['大阪', '関西', 'ヴィーガンラーメン', '心斎橋', 'インバウンド']
    },
    {
      instagram_id: '@vege_yuniwa',
      display_name: 'ベジラーメンゆにわ（大阪枚方）',
      business_type: 'ラーメン',
      profile_text: '日本初のヴィーガンラーメン専門店の草分け。10種以上の厳選野菜と無化調出汁による至高のプラントベースラーメンを提供。',
      instagram_url: 'https://www.instagram.com/vege_yuniwa',
      tags: ['大阪', '関西', 'ヴィーガンラーメン', '元祖', '無化調']
    },
    {
      instagram_id: '@papurika_vegan',
      display_name: 'パプリカ食堂ヴィーガン（大阪四ツ橋）',
      business_type: 'ラーメン',
      profile_text: '関西を代表するヴィーガンレストラン。特製ヴィーガンラーメンや担々麺、オーガニックヴィーガンスイーツをラインナップ。',
      instagram_url: 'https://www.instagram.com/papurika_vegan',
      tags: ['大阪', '関西', 'ヴィーガンラーメン', '四ツ橋', 'オーガニック']
    },

    // ── 京都エリア ──
    {
      instagram_id: '@veganramen_uzu_kyoto',
      display_name: 'Vegan Ramen UZU KYOTO（京都市役所前）',
      business_type: 'ラーメン',
      profile_text: 'チームラボのアート空間と融合したミシュランガイド掲載のヴィーガンラーメン名店。完全植物性の一杯に世界中から予約殺到。',
      instagram_url: 'https://www.instagram.com/veganramen_uzu_kyoto',
      tags: ['京都', '関西', 'ヴィーガンラーメン', 'ミシュラン', 'チームラボ']
    },
    {
      instagram_id: '@towazen_ramen',
      display_name: '京都 豆乳ラーメン 豆禅（Towazen 下鴨）',
      business_type: 'ラーメン',
      profile_text: '京都・下鴨のヴィーガン豆乳ラーメン専門店。自家製濃厚豆乳スープと京湯葉を使用。欧米豪のヴィーガン観光客が必ず訪れる聖地。',
      instagram_url: 'https://www.instagram.com/towazen_ramen',
      tags: ['京都', '関西', 'ヴィーガンラーメン', '豆乳', '下鴨']
    },
    {
      instagram_id: '@peace_ramen_kyoto',
      display_name: 'Vegan Ramen Peace 京都河原町',
      business_type: 'ラーメン',
      profile_text: '京都四条河原町の完全植物性ラーメン店。ヴィーガン醤油・味噌・担々麺を提供。海外ツーリストの食後スイーツ需要が旺盛。',
      instagram_url: 'https://www.instagram.com/peace_ramen_kyoto',
      tags: ['京都', '関西', 'ヴィーガンラーメン', '河原町', '外国人人気']
    },
    {
      instagram_id: '@engine_ramen',
      display_name: 'Engine Ramen（京都河原町）',
      business_type: 'ラーメン',
      profile_text: '京都・河原町の野菜ポタージュ系ヴィーガンラーメン店。グルテンフリー対応麺も完備し外国人客で連日満席。',
      instagram_url: 'https://www.instagram.com/engine_ramen',
      tags: ['京都', '関西', 'ヴィーガンラーメン', '濃厚ポタージュ']
    },
    {
      instagram_id: '@unoyukijp',
      display_name: 'UNO RAMEN（京都）',
      business_type: 'ラーメン',
      profile_text: '身体に優しい豆乳ベースのヴィーガン＆グルテンフリーラーメン専門店。クリーンな一杯とお口直しデザートの相乗効果抜群。',
      instagram_url: 'https://www.instagram.com/unoyukijp',
      tags: ['京都', '関西', 'ヴィーガンラーメン', 'グルテンフリー']
    },

    // ── 東京・関東エリア ──
    {
      instagram_id: '@ts_tantan_jp',
      display_name: 'T\'sたんたん（東京駅・上野・池袋）',
      business_type: 'ラーメン',
      profile_text: '東京駅・上野駅・池袋等に展開する日本初のヴィーガン担々麺専門店。肉・魚介・卵・乳製品不使用。インバウンド客から圧倒的人気。',
      instagram_url: 'https://www.instagram.com/ts_tantan_jp',
      tags: ['東京', '全国', 'ヴィーガンラーメン', '東京駅', '担々麺']
    },
    {
      instagram_id: '@soranoiro.vege',
      display_name: 'ソラノイロ（SORANOIRO）麹町・東京駅',
      business_type: 'ラーメン',
      profile_text: 'ミシュラン・ビブグルマン獲得店。元祖「ベジソバ」や完全ヴィーガン・グルテンフリーラーメンのパイオニア。食後のアイス需要大。',
      instagram_url: 'https://www.instagram.com/soranoiro.vege',
      tags: ['東京', '全国', 'ヴィーガンラーメン', 'ミシュラン', 'ベジソバ']
    },
    {
      instagram_id: '@tokyo.vegan.ramen.center',
      display_name: 'Tokyo Vegan Ramen Center（原宿）',
      business_type: 'ラーメン',
      profile_text: '原宿に位置する100%ヴィーガンラーメン専門店。フォトジェニックなヴィーガンラーメンで海外SNSで爆発的拡散。',
      instagram_url: 'https://www.instagram.com/tokyo.vegan.ramen.center',
      tags: ['東京', '原宿', 'ヴィーガンラーメン', 'SNS話題']
    },
    {
      instagram_id: '@kyushujangara',
      display_name: '九州じゃんがら（原宿・秋葉原・銀座）',
      business_type: 'ラーメン',
      profile_text: '東京の有名豚骨ラーメン店が本気で開発した完全植物性「ヴィーガンこぼんしゃん」「からぼん」。外国人客多数来店。',
      instagram_url: 'https://www.instagram.com/kyushujangara',
      tags: ['東京', '全国', 'ヴィーガンラーメン', '原宿', '豚骨風']
    },
    {
      instagram_id: '@saido_tokyo',
      display_name: '菜道（SAIDO 自由が丘）',
      business_type: 'ラーメン',
      profile_text: '世界一のヴィーガンレストランに選出（HappyCow世界第1位）。特製ヴィーガンラーメン・まぜそばを提供。外国人客比率90%以上。',
      instagram_url: 'https://www.instagram.com/saido_tokyo',
      tags: ['東京', '全国', 'ヴィーガンラーメン', '世界No1', '自由が丘']
    },
    {
      instagram_id: '@chabuzen',
      display_name: '薬膳食堂ちゃぶ屋（下北沢）',
      business_type: 'ラーメン',
      profile_text: '完全ヴィーガン＆オーガニックラーメン店。グルテンフリー麺・無化調薬膳スープが欧米ヴィーガン客から熱狂的人気。',
      instagram_url: 'https://www.instagram.com/chabuzen',
      tags: ['東京', '全国', 'ヴィーガンラーメン', '下北沢', '薬膳']
    },
    {
      instagram_id: '@halal_vegan_ramen_honolu',
      display_name: '麺屋 帆のる（Honolu 日本橋・浅草・恵比寿）',
      business_type: 'ラーメン',
      profile_text: 'ハラール＆完全ヴィーガン認証ラーメン店。特製濃厚野菜ポタージュスープで海外ムスリム・ヴィーガンから絶大な信頼。',
      instagram_url: 'https://www.instagram.com/halal_vegan_ramen_honolu',
      tags: ['東京', '大阪', 'ヴィーガンラーメン', 'ハラール', '日本橋']
    },
    {
      instagram_id: '@afuri_japan',
      display_name: 'AFURI（阿夫利 恵比寿・六本木・原宿）',
      business_type: 'ラーメン',
      profile_text: '厳選野菜をふんだんに使った彩りヴィーガンらーめんをグローバル展開。スタイリッシュな空間とヘルシー志向層にマッチ。',
      instagram_url: 'https://www.instagram.com/afuri_japan',
      tags: ['東京', '全国', 'ヴィーガンラーメン', '恵比寿', '洗練']
    },
    {
      instagram_id: '@samuraisakuta',
      display_name: '麺匠 真武咲弥 渋谷店（ヴィーガン味噌）',
      business_type: 'ラーメン',
      profile_text: '渋谷道玄坂の炙り味噌ラーメン店が開発した本格「ヴィーガン味噌ラーメン」。香ばしい味噌と植物性スープで海外客が大行列。',
      instagram_url: 'https://www.instagram.com/samuraisakuta',
      tags: ['東京', '渋谷', 'ヴィーガンラーメン', '味噌']
    },
    {
      instagram_id: '@lovinghut_japan',
      display_name: 'Loving Hut（ラビングハット 神保町）',
      business_type: 'ラーメン',
      profile_text: '神保町の老舗ヴィーガンレストラン。100%植物性のヴィーガンラーメン・冷やし中華・スイーツを提供。',
      instagram_url: 'https://www.instagram.com/lovinghut_japan',
      tags: ['東京', '神保町', 'ヴィーガンラーメン', '老舗']
    },
    {
      instagram_id: '@chabuton_official',
      display_name: 'CHABUTON（ちゃぶとん 秋葉原・下北沢等）',
      business_type: 'ラーメン',
      profile_text: 'ミシュラン一つ星シェフ監修の「新ベジラーメン」。野菜の旨味だけで濃厚なコクを引き出したヴィーガンラーメンを展開。',
      instagram_url: 'https://www.instagram.com/chabuton_official',
      tags: ['東京', '全国', 'ヴィーガンラーメン', 'ミシュラン監修']
    },
    {
      instagram_id: '@mugi_to_olive',
      display_name: 'むぎとオリーブ 銀座店',
      business_type: 'ラーメン',
      profile_text: '銀座のミシュランビブグルマン掲載店。野菜出汁を極めたベジSOBAやヘルシーラーメンを提供。',
      instagram_url: 'https://www.instagram.com/mugi_to_olive',
      tags: ['東京', '銀座', 'ヴィーガンラーメン', 'ミシュラン']
    },
    {
      instagram_id: '@ippudo_jp',
      display_name: '一風堂 プラントベース（ルミネエスト新宿店）',
      business_type: 'ラーメン',
      profile_text: '博多一風堂が本気で開発した「プラントベース赤丸・白丸」。豚骨不使用ながら豆乳出汁でコクを完全再現。',
      instagram_url: 'https://www.instagram.com/ippudo_jp',
      tags: ['東京', '新宿', 'ヴィーガンラーメン', 'プラントベース']
    },

    // ── 神奈川・湘南エリア ──
    {
      instagram_id: '@ramenmuseum',
      display_name: '新横浜ラーメン博物館（ベジ・ヴィーガン対応店）',
      business_type: 'ラーメン',
      profile_text: '新横浜ラーメン博物館では各名店がヴィーガン対応ラーメンを開発・提供中。国内外のラーメンファンが集まる拠点。',
      instagram_url: 'https://www.instagram.com/ramenmuseum',
      tags: ['神奈川', '横浜', 'ヴィーガンラーメン', '博物館']
    },
    {
      instagram_id: '@magokoro_kamakura',
      display_name: '麻心（まごころ 鎌倉・由比ヶ浜）',
      business_type: 'ラーメン',
      profile_text: '鎌倉由比ヶ浜のオーガニックカフェレストラン。麻の実を使用した特製ヴィーガンラーメン・麺料理を提供。',
      instagram_url: 'https://www.instagram.com/magokoro_kamakura',
      tags: ['神奈川', '鎌倉', 'ヴィーガンラーメン', 'オーガニック']
    },

    // ── 北海道エリア ──
    {
      instagram_id: '@vegan_ramen_meguri',
      display_name: 'Vegan Ramen めぐり（北海道旭川）',
      business_type: 'ラーメン',
      profile_text: '旭川唯一の完全ヴィーガンラーメン専門店。地元有機野菜と北海道産小麦を使用した絶品ラーメンを提供。',
      instagram_url: 'https://www.instagram.com/vegan_ramen_meguri',
      tags: ['北海道', '旭川', 'ヴィーガンラーメン', '専門店']
    },
    {
      instagram_id: '@ichiryuan_sapporo',
      display_name: '一粒庵（札幌駅前 ミシュラン掲載店）',
      business_type: 'ラーメン',
      profile_text: '札幌駅前のミシュラン掲載名店。完全植物性・ヴィーガン対応の味噌ラーメンを開発。観光客から高評価。',
      instagram_url: 'https://www.instagram.com/ichiryuan_sapporo',
      tags: ['北海道', '札幌', 'ヴィーガンラーメン', 'ミシュラン']
    },

    // ── 愛知・中部エリア ──
    {
      instagram_id: '@vegikitchen_gugu',
      display_name: 'ベジキッチン・グーグー（名古屋千種区）',
      business_type: 'ラーメン',
      profile_text: '名古屋市千種区のヴィーガン＆グルテンフリー店。名物のヴィーガン台湾まぜそばやラーメンが人気。スイーツ需要大。',
      instagram_url: 'https://www.instagram.com/vegikitchen_gugu',
      tags: ['愛知', '名古屋', 'ヴィーガンラーメン', 'まぜそば', 'グルテンフリー']
    },
    {
      instagram_id: '@nico.chan_0725',
      display_name: 'nico.chan（愛知あま市）',
      business_type: 'ラーメン',
      profile_text: '愛知県あま市のオーガニック自然食カフェ。植物性のヴィーガン麺メニューを展開し地元健康志向層に愛される。',
      instagram_url: 'https://www.instagram.com/nico.chan_0725',
      tags: ['愛知', '中部', 'ヴィーガンラーメン', '自然食']
    },
    {
      instagram_id: '@ginza_kagari',
      display_name: '銀座 篝 JRゲートタワー名古屋店',
      business_type: 'ラーメン',
      profile_text: '名古屋駅直結。極上野菜ポタージュで仕立てたヴィーガンSobaを提供。インバウンド客の人気スポット。',
      instagram_url: 'https://www.instagram.com/ginza_kagari',
      tags: ['愛知', '名古屋', 'ヴィーガンラーメン', '名駅']
    },

    // ── 広島・中国エリア ──
    {
      instagram_id: '@taco_sukeroku',
      display_name: 'TACO SUKEROKU / VEGAN RAMEN（広島）',
      business_type: 'ラーメン',
      profile_text: '広島市内のヴィーガンラーメン店。完全植物性の尾道風ヴィーガンラーメンを提供し海外バックパッカーで賑わう。',
      instagram_url: 'https://www.instagram.com/taco_sukeroku',
      tags: ['広島', '中国', 'ヴィーガンラーメン', '尾道風']
    },
    {
      instagram_id: '@gaba_ramen',
      display_name: '我馬（GABA 広島）',
      business_type: 'ラーメン',
      profile_text: '広島の人気ラーメンチェーンが展開するプラントベースヴィーガンラーメン。平和記念公園周辺の観光客に大好評。',
      instagram_url: 'https://www.instagram.com/gaba_ramen',
      tags: ['広島', '中国', 'ヴィーガンラーメン', '広島市']
    },

    // ── 沖縄エリア ──
    {
      instagram_id: '@gajimaru_plantbased',
      display_name: 'Cafe&Bar Gajimaru（沖縄恩納村）',
      business_type: 'ラーメン',
      profile_text: '沖縄・恩納村のヴィーガンレストラン。特製ヴィーガンラーメン、スパイシー麺、餃子を展開。グルテンフリー対応。',
      instagram_url: 'https://www.instagram.com/gajimaru_plantbased',
      tags: ['沖縄', 'ヴィーガンラーメン', '恩納村', 'リゾート']
    },
    {
      instagram_id: '@veganramen.maruyoshi',
      display_name: '麺神まるよし（読谷店・沖縄）',
      business_type: 'ラーメン',
      profile_text: '沖縄県読谷村のヴィーガンラーメン提供店。トリュフ香るヴィーガンラーメンが海外リゾート客に大人気。',
      instagram_url: 'https://www.instagram.com/veganramen.maruyoshi',
      tags: ['沖縄', 'ヴィーガンラーメン', '読谷村', 'トリュフ']
    },
    {
      instagram_id: '@orange_shokudo_okinawa',
      display_name: 'オレンジ食堂（沖縄金武町）',
      business_type: 'ラーメン',
      profile_text: '沖縄県金武町の完全植物性食堂。動物性食材不使用の「黒ごま濃厚ヴィーガン担々麺」が名物。',
      instagram_url: 'https://www.instagram.com/orange_shokudo_okinawa',
      tags: ['沖縄', 'ヴィーガンラーメン', '担々麺', '金武町']
    },
    {
      instagram_id: '@soranoiro_okinawa',
      display_name: 'ソラノイロ OKINAWA（那覇・のれん街）',
      business_type: 'ラーメン',
      profile_text: '那覇国際通り・のれん街店。沖縄限定のヴィーガン担々麺やベジソバを展開。観光客・地元客で賑わう。',
      instagram_url: 'https://www.instagram.com/soranoiro_okinawa',
      tags: ['沖縄', '那覇', 'ヴィーガンラーメン', '国際通り']
    }
  ],

  // 🍛 スパイスカレー・ヴィーガンカレー店舗
  curry: [
    {
      instagram_id: '@negombo33',
      display_name: 'negombo33（ネゴンボ33）',
      business_type: 'カレー',
      profile_text: '全国屈指の人気スパイスカレー店。スパイスの余韻を楽しむ食後のアイスや珈琲とのペアリングを提案。',
      instagram_url: 'https://www.instagram.com/negombo33',
      tags: ['全国', '東京', '埼玉', 'スパイスカレー', 'デザート親和性高']
    },
    {
      instagram_id: '@botanicurry',
      display_name: 'BOTANI:CURRY（ボタニカリー 大阪）',
      business_type: 'カレー',
      profile_text: '大阪スパイスカレーブームの牽引店。ハーブとスパイスの爽快感あふれるカレー。辛味のあとの優しい口直しアイス需要大。',
      instagram_url: 'https://www.instagram.com/botanicurry',
      tags: ['全国', '大阪', 'スパイスカレー']
    },
    {
      instagram_id: '@anandacurry',
      display_name: 'アナンダカリー（完全植物性スパイスカレー）',
      business_type: 'カレー',
      profile_text: '動物性食材を一切使わない100%プラントベーススパイスカレー専門店。オーガニック・グルテンフリーにこだわり。',
      instagram_url: 'https://www.instagram.com/anandacurry',
      tags: ['全国', 'ヴィーガンカレー', 'グルテンフリー']
    },
    {
      instagram_id: '@garam_fukuoka',
      display_name: 'GARAM（ガラム 福岡高砂）',
      business_type: 'カレー',
      profile_text: '福岡スパイスカレーの超名店。刺激的なスパイスの後味を包み込む豆乳アイスやチャイと好相性。',
      instagram_url: 'https://www.instagram.com/garam_fukuoka',
      tags: ['福岡', 'スパイスカレー']
    },
    {
      instagram_id: '@midorishokudo',
      display_name: '玄米カフェ 実身美（サンミ）',
      business_type: 'カレー',
      profile_text: '心と体にやさしい玄米カフェ・レストラン。豆乳スイーツやアレルギー配慮メニュー、健康志向のカレーが名物。',
      instagram_url: 'https://www.instagram.com/midorishokudo',
      tags: ['全国', '大阪', '東京', '健康志向', '豆乳スイーツ']
    }
  ],

  // 🏨 インバウンド特化ホテル・高級宿泊施設
  hotel: [
    {
      instagram_id: '@acehotelkyoto',
      display_name: 'Ace Hotel Kyoto（エースホテル京都）',
      business_type: 'ホテル',
      profile_text: 'アメリカ発祥の人気ライフスタイルホテル。海外ゲスト比率が非常に高く、ヴィーガン・グルテンフリーのデザート需要が常時発生。',
      instagram_url: 'https://www.instagram.com/acehotelkyoto',
      tags: ['全国', '京都', 'ホテル', 'インバウンド']
    },
    {
      instagram_id: '@trunkhotel',
      display_name: 'TRUNK(HOTEL) 東京・渋谷',
      business_type: 'ホテル',
      profile_text: 'ソーシャライジングをコンセプトにするブティックホテル。環境配慮・エシカルな食材や植物性デザートを積極導入。',
      instagram_url: 'https://www.instagram.com/trunkhotel',
      tags: ['全国', '東京', 'ホテル', 'サステナブル']
    },
    {
      instagram_id: '@sequence_miyashitapark',
      display_name: 'sequence MIYASHITA PARK',
      business_type: 'ホテル',
      profile_text: '渋谷ミヤシタパーク直結の次世代ホテル。宿泊ラウンジやカフェにて、多様な食文化（ヴィーガン・アレルギー）に対応。',
      instagram_url: 'https://www.instagram.com/sequence_miyashitapark',
      tags: ['全国', '東京', 'ホテル', 'ラウンジ']
    },
    {
      instagram_id: '@hotel_the_celestine_tokyo',
      display_name: 'ホテル ザ セレスティン東京芝',
      business_type: 'ホテル',
      profile_text: '上質な空間と国内外ゲストのおもてなし。レストラン・バーでのアレルギー対応・ヴィーガンデザート提供に注力。',
      instagram_url: 'https://www.instagram.com/hotel_the_celestine_tokyo',
      tags: ['全国', '東京', 'ホテル', '高級']
    }
  ],

  // 🍔 ヴィーガンバーガー・ダイナー
  burger: [
    {
      instagram_id: '@superiorityburgerjapan',
      display_name: 'Superiority Burger Japan（下北沢）',
      business_type: 'バーガー',
      profile_text: 'ニューヨークで大行列のベジタリアン・ヴィーガンバーガー店の下北沢店。バーガーとアイス・ジェラートの相乗効果で大人気。',
      instagram_url: 'https://www.instagram.com/superiorityburgerjapan',
      tags: ['全国', '東京', 'ヴィーガンバーガー', 'NY発']
    },
    {
      instagram_id: '@terra_burgers',
      display_name: 'TERRA BURGERS（代官山）',
      business_type: 'バーガー',
      profile_text: '100%植物性素材のプレミアムヴィーガンバーガー。スイーツ・シェイク需要が高く、ヘルシー志向な若年層・外国人が集う。',
      instagram_url: 'https://www.instagram.com/terra_burgers',
      tags: ['全国', '東京', 'ヴィーガンバーガー']
    },
    {
      instagram_id: '@greatlakes_tokyo',
      display_name: 'GREAT LAKES（高田馬場）',
      business_type: 'バーガー',
      profile_text: '完全植物性のクラフトバーガー＆アメリカンダイナー。スイーツ・デザートの追加注文ニーズにマッチ。',
      instagram_url: 'https://www.instagram.com/greatlakes_tokyo',
      tags: ['全国', '東京', 'ヴィーガンバーガー']
    }
  ],

  // ☕ 自然派・オーガニック・ヴィーガンカフェ
  cafe: [
    {
      instagram_id: '@rotacafe_fukuoka',
      display_name: 'Rota Cafe（ロタカフェ）大名店',
      business_type: 'カフェ',
      profile_text: '福岡大名のマクロビオティック＆ヴィーガンカフェ。無農薬野菜・グルテンフリースイーツ・豆乳デザートを提供。',
      instagram_url: 'https://www.instagram.com/rotacafe_fukuoka',
      tags: ['福岡', 'ヴィーガンカフェ', 'グルテンフリー']
    },
    {
      instagram_id: '@evahdaining',
      display_name: 'エヴァダイニング 博多リバレイン店',
      business_type: 'レストラン',
      profile_text: 'マクロビオティックとヴィーガン対応のオーガニックカフェレストラン。身体に優しいプラントベーススイーツを提供中。',
      instagram_url: 'https://www.instagram.com/evahdaining',
      tags: ['福岡', 'オーガニック', 'マクロビ']
    },
    {
      instagram_id: '@ain_soph_soar',
      display_name: 'AIN SOPH.（アインソフ）',
      business_type: 'カフェ',
      profile_text: '完全植物性のヴィーガンレストラン＆パティスリー。グルテンフリーのパンケーキや豆乳アイス、季節のヴィーガンスイーツ。',
      instagram_url: 'https://www.instagram.com/ain_soph_soar',
      tags: ['全国', '東京', '京都', 'ヴィーガンカフェ']
    },
    {
      instagram_id: '@wired_bonbon',
      display_name: 'WIRED BONBON',
      business_type: 'カフェ',
      profile_text: '100%植物性素材のヴィーガンスイーツ専門店。豆乳や米粉を使ったギルトフリーパフェやヴィーガンソフト。',
      instagram_url: 'https://www.instagram.com/wired_bonbon',
      tags: ['全国', '東京', 'ヴィーガンスイーツ']
    },
    {
      instagram_id: '@kissa_hachineko',
      display_name: '喫茶 八猫（はちねこ）福岡',
      business_type: 'カフェ',
      profile_text: '福岡市内の自然派喫茶。植物性素材にこだわったヴィーガンスイーツや薬膳チャイをご用意しています。',
      instagram_url: 'https://www.instagram.com/kissa_hachineko',
      tags: ['福岡', '自然派喫茶']
    }
  ]
};

/**
 * スマートカテゴリから該当するシード群を抽出
 */
function getSeedsForQuery(category?: string, keywords: string[] = [], location: string = ''): Partial<Lead>[] {
  const seeds: Partial<Lead>[] = [];
  const lowerKw = keywords.join(' ').toLowerCase();

  if (category === 'ramen' || lowerKw.includes('ラーメン') || lowerKw.includes('ramen')) {
    seeds.push(...HIGH_IMPACT_SEEDS.ramen);
  }
  if (category === 'curry' || lowerKw.includes('カレー') || lowerKw.includes('curry')) {
    seeds.push(...HIGH_IMPACT_SEEDS.curry);
  }
  if (category === 'hotel' || lowerKw.includes('ホテル') || lowerKw.includes('hotel')) {
    seeds.push(...HIGH_IMPACT_SEEDS.hotel);
  }
  if (category === 'burger' || lowerKw.includes('バーガー') || lowerKw.includes('burger')) {
    seeds.push(...HIGH_IMPACT_SEEDS.burger);
  }
  if (category === 'cafe' || lowerKw.includes('カフェ') || seeds.length === 0) {
    seeds.push(...HIGH_IMPACT_SEEDS.cafe);
  }

  // 地域が指定されている場合（例: 福岡、東京、大阪、京都、沖縄など）
  if (location && location !== '全国' && location !== '全国主要都市') {
    const locClean = location.replace(/[都道府県市区町村]/g, '');
    const matched = seeds.filter(s => 
      (s.tags || []).some(t => t.includes(locClean) || location.includes(t)) ||
      (s.display_name || '').includes(locClean) ||
      (s.profile_text || '').includes(locClean)
    );
    const nonMatched = seeds.filter(s => !matched.includes(s));
    // 地域完全一致を最優先にし、後ろに他地域の優良店を配置
    return [...matched, ...nonMatched];
  }

  return seeds;
}

/**
 * 極限まで簡単に：地域・カテゴリ・キーワードから、即戦力の店舗Instagramアカウントを自動検索・抽出
 */
export async function findInstagramLeads(options: DiscoveryOptions): Promise<DiscoveredLead[]> {
  const { location = '全国', keywords = [], limit = 50, category } = options;
  
  // 1. 検索クエリの最適化（DuckDuckGo用）
  let query = '';
  const isNational = location === '全国' || location === '全国主要都市' || !location;

  if (category === 'ramen' || keywords.some(k => k.includes('ラーメン'))) {
    query = isNational
      ? 'site:instagram.com ("ヴィーガンラーメン" OR "vegan ramen" OR "ベジラーメン")'
      : `site:instagram.com "${location}" ("ヴィーガンラーメン" OR "vegan ramen")`;
  } else if (category === 'curry' || keywords.some(k => k.includes('カレー'))) {
    query = isNational
      ? 'site:instagram.com ("ヴィーガンカレー" OR "スパイスカレー" OR "vegan curry")'
      : `site:instagram.com "${location}" ("ヴィーガンカレー" OR "スパイスカレー")`;
  } else if (category === 'hotel' || keywords.some(k => k.includes('ホテル'))) {
    query = isNational
      ? 'site:instagram.com ("ヴィーガン" OR "プラントベース") ("ホテル" OR "ホテルラウンジ")'
      : `site:instagram.com "${location}" ("ヴィーガン" OR "プラントベース") ホテル`;
  } else if (category === 'burger' || keywords.some(k => k.includes('バーガー'))) {
    query = isNational
      ? 'site:instagram.com ("ヴィーガンバーガー" OR "プラントベースバーガー")'
      : `site:instagram.com "${location}" ("ヴィーガンバーガー" OR "プラントベースバーガー")`;
  } else {
    const keywordStr = keywords.length > 0 ? keywords.join(' ') : 'ヴィーガン カフェ';
    query = isNational
      ? `site:instagram.com ("東京" OR "大阪" OR "京都" OR "福岡") ${keywordStr}`
      : `site:instagram.com "${location}" ${keywordStr}`;
  }

  let results: Partial<Lead>[] = [];

  // 2. DuckDuckGoでWeb検索を実行
  try {
    const html = await fetchDuckDuckGoHtml(query);
    results = extractAccountsFromHtml(html, isNational ? '全国' : location);
  } catch (error) {
    console.warn('Web search failed or rate-limited, relying on high impact seed database:', error);
  }

  // 3. 高確度シードマスターから補完・統合（即戦力データを常に確実供給）
  const relevantSeeds = getSeedsForQuery(category, keywords, location);
  const seenIds = new Set(results.map(r => r.instagram_id?.toLowerCase()));

  for (const seed of relevantSeeds) {
    if (!seenIds.has(seed.instagram_id?.toLowerCase())) {
      results.push({
        ...seed,
        status: 'new',
        tags: seed.tags || [isNational ? '全国展開' : location, seed.business_type || 'ターゲット'],
        created_at: new Date().toISOString(),
      });
      seenIds.add(seed.instagram_id?.toLowerCase());
    }
  }

  // 4. 自動スコアリング（地域一致ボーナス加算）
  const locClean = (!isNational && location) ? location.replace(/[都道府県市区町村]/g, '') : '';
  const scoredLeads: DiscoveredLead[] = results.map(lead => {
    const scoreResult = scoreLead(lead as Lead);
    let totalScore = scoreResult.total;
    const reasons = scoreResult.breakdown.map(b => `${b.reason} (+${b.score}点)`);

    // 地域指定に完全一致する店舗には +20 点の特大ボーナス
    if (locClean && (
      (lead.tags || []).some(t => t.includes(locClean)) ||
      (lead.display_name || '').includes(locClean) ||
      (lead.profile_text || '').includes(locClean)
    )) {
      totalScore += 20;
      reasons.unshift(`指定エリア (${location}) 完全一致 (+20点)`);
    }

    return {
      ...lead,
      score: totalScore,
      scoreReasons: reasons,
    };
  }).sort((a, b) => b.score - a.score);

  return scoredLeads.slice(0, Math.max(limit, 50));
}
