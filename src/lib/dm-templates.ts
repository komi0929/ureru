import { Lead } from '@/types';

export interface DmTemplateConfig {
  id: string;
  name: string;
  category: 'initial_contact' | 'follow_up' | 'sample_offer' | string;
  template: string;
  variables: string[];
}

export const BUSINESS_REASONS: Record<string, string> = {
  'ラーメン': 'こだわり抜かれたヴィーガンラーメンへの熱い想い',
  'カレー': 'スパイス香る本格的なカレー作りへのこだわり',
  'バーガー': '満足感とヘルシーさを両立されたバーガーへの情熱',
  'ホテル': '国内外のゲストを迎える上質なおもてなしへの姿勢',
  'カフェ': '素敵なメニューや空間作りへのこだわり',
  'レストラン': 'お料理とお客様への情熱',
  'ベーカリー': '美味しいパン作りへのこだわり',
  'デリ': '体に優しい食へのこだわり',
  'バー': '独自の空間作りへのこだわり',
  'default': '素敵なお店作りへのこだわり',
};

export const BUSINESS_BENEFITS: Record<string, string> = {
  'ラーメン': '熱々のラーメンを食べた後の「さっぱりしたお口直し」や、外国人観光客向けの「客単価アップメニュー（+500円デザート）」に最適です。個包装カップのため厨房オペレーションの負荷もゼロで導入いただけます',
  'カレー': 'スパイシーなカレーを食べたあとの「クールダウン豆乳アイス」としてお客様に大好評です',
  'バーガー': 'バーガーやポテトとのセットメニュー、ギルトフリーなデザートとして相性抜群です',
  'ホテル': '訪日外国人宿泊客から要望の多いアレルギー・ヴィーガン対応デザートとして、冷凍ストックでロスなくご活用いただけます',
  'カフェ': 'カフェメニューの差別化やアレルギー対応の目玉に最適です',
  'レストラン': 'デザートメニューの付加価値向上とヴィーガン対応に繋がります',
  'ベーカリー': 'パンに合うトッピングやテイクアウトスイーツとして喜ばれています',
  'default': 'アレルギー・ヴィーガン対応メニューとして新しいお客様層を開拓できます',
};

export function getTemplates(): DmTemplateConfig[] {
  return [
    {
      id: 'initial_a',
      name: '初回コンタクトA (熱意・メリット訴求型)',
      category: 'initial_contact',
      template: 'こんにちは！{{store_name}}さんのInstagramを拝見して、{{reason}}を感じてご連絡いたしました。\n\n私たちは「SoyStories」という、福岡発の100%植物性・グルテンフリーの濃厚大豆クラフトアイスをお届けしています🌿\n\n{{benefit}}。\n\nもしよろしければ、お店のスタッフ様でご試食用に【無料サンプルセット】をクール便でお届けさせていただけないでしょうか？😊\n\nご興味ありましたら、ぜひお気軽にご返信ください！\nhttps://www.soystories.cafe/',
      variables: ['store_name', 'reason', 'benefit']
    },
    {
      id: 'initial_b',
      name: '初回コンタクトB (簡潔・サンプル直球型)',
      category: 'initial_contact',
      template: '突然のご連絡失礼いたします。{{store_name}}さんの素敵なお取り組みに惹かれてDMさせていただきました。\n\n豆乳クラフトアイス「SoyStories」は、乳・卵・小麦不使用で、{{benefit}}。\n\n現在、店舗様向けに無料サンプル（人気6種フレーバー）を無償配送しております🍨\nお忙しいところ恐れ入りますが、ぜひ一度お味見していただけますと幸いです！\n\nhttps://www.soystories.cafe/',
      variables: ['store_name', 'benefit']
    },
    {
      id: 'initial_c',
      name: '初回コンタクトC (ショート・SNS親和型)',
      category: 'initial_contact',
      template: 'こんにちは！プラントベースアイス「SoyStories」と申します🌿\n{{store_name}}さんのお客様に喜んでいただけそうと思いDMいたしました！\nスタッフ様でお試しいただける無料サンプルをすぐにお手配できますので、もしご興味あれば「サンプル希望」とお気軽に一言ご返信ください😊\nhttps://www.soystories.cafe/',
      variables: ['store_name']
    },
    {
      id: 'follow_up',
      name: 'フォローアップ (未返信への丁寧な再送)',
      category: 'follow_up',
      template: '{{store_name}}さん、先日は突然のDM失礼いたしました。\nその後、お忙しいところ恐縮ですが、プラントベースアイスの無料サンプルにご興味はいかがでしたでしょうか？🌱\nメニューの拡充やインバウンド対応でお役に立てましたら幸いです。ご負担のない範囲でご返信いただけますと幸いです！',
      variables: ['store_name']
    }
  ];
}

export function getReasonForBusiness(businessType: string): string {
  return BUSINESS_REASONS[businessType] || BUSINESS_REASONS['default'];
}

export function getBenefitForBusiness(businessType: string): string {
  return BUSINESS_BENEFITS[businessType] || BUSINESS_BENEFITS['default'];
}

export function generateDM(template: DmTemplateConfig, lead: Lead): string {
  let content = template.template;
  
  const storeName = lead.display_name || (lead as any).name || 'ご担当者';
  const businessType = lead.business_type || 'default';
  
  const replacements: Record<string, string> = {
    'store_name': storeName,
    'reason': getReasonForBusiness(businessType),
    'benefit': getBenefitForBusiness(businessType)
  };
  
  template.variables.forEach(variable => {
    const value = replacements[variable] || '';
    const regex = new RegExp(`{{${variable}}}`, 'g');
    content = content.replace(regex, value);
  });
  
  return content;
}
