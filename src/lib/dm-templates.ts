import { Lead } from '@/types';

export interface DmTemplateConfig {
  id: string;
  name: string;
  category: 'initial_contact' | 'follow_up' | 'sample_offer' | string;
  template: string;
  variables: string[];
}

export const BUSINESS_REASONS: Record<string, string> = {
  'カフェ': '素敵なメニューへのこだわり',
  'レストラン': 'お料理への情熱',
  'ベーカリー': '美味しいパン作りへのこだわり',
  'ホテル': '上質なおもてなしへの姿勢',
  'デリ': '体に優しい食へのこだわり',
  'バー': '独自の空間作りへのこだわり',
  'default': '素敵なお店作りへのこだわり',
};

export const BUSINESS_BENEFITS: Record<string, string> = {
  'カフェ': 'カフェメニューの差別化に最適です',
  'レストラン': 'デザートメニューの付加価値向上に繋がります',
  'ベーカリー': 'パンに合うトッピングとしてお客様に喜ばれています',
  'ホテル': '宴会・ビュッフェのデザートに最適です',
  'default': 'アレルギー対応メニューとして新しいお客様層を開拓できます',
};

export function getTemplates(): DmTemplateConfig[] {
  return [
    {
      id: 'initial_a',
      name: '初回コンタクトA (シンプル)',
      category: 'initial_contact',
      template: 'こんにちは！{{store_name}}さんの投稿を拝見して、{{reason}}と感じてご連絡しました。\n\n私たちはSoyStoriesという、100%プラントベース・グルテンフリーのアイスクリームを作っています🌿\n\nもしよろしければ、無料サンプルをお送りしますので、お気軽にご返信ください😊\n\nhttps://www.soystories.cafe/',
      variables: ['store_name', 'reason']
    },
    {
      id: 'initial_b',
      name: '初回コンタクトB (商品特徴訴求)',
      category: 'initial_contact',
      template: '突然のご連絡失礼いたします。{{store_name}}さんの素敵なお店に惹かれてDMさせていただきました。\n\n豆乳ベースのアイス「SoyStories」は、乳製品・小麦不使用で{{benefit}}。\n6種のフレーバーを用意しており、無料サンプルもお送りできます🍨\n\nhttps://www.soystories.cafe/',
      variables: ['store_name', 'benefit']
    },
    {
      id: 'initial_c',
      name: '初回コンタクトC (極短)',
      category: 'initial_contact',
      template: 'こんにちは！プラントベースアイス「SoyStories」と申します🌿\n{{store_name}}さんのお店で使っていただけたらと思いご連絡しました。無料サンプルお送りできますので、ご興味あればお気軽に😊\nhttps://www.soystories.cafe/',
      variables: ['store_name']
    },
    {
      id: 'follow_up',
      name: 'フォローアップ (返信なし後1週間)',
      category: 'follow_up',
      template: '{{store_name}}さん、先日はDM失礼いたしました。\nその後、プラントベースアイスにご興味はいかがでしょうか？\nお忙しいところ恐れ入りますが、ご返信いただけると嬉しいです🌱',
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
  
  // Safely cast or get properties since Lead type structure might vary slightly
  const leadAny = lead as any;
  const storeName = leadAny.store_name || leadAny.storeName || leadAny.name || 'ご担当者';
  const businessType = leadAny.industry || leadAny.businessType || leadAny.type || 'default';
  
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
