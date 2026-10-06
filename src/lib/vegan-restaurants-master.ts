import { Lead } from '@/types';
import { VEGAN_RESTAURANTS_EXPANSION } from './vegan-restaurants-expansion';

export type VeganGenre =
  | 'ラーメン'
  | 'バーガー'
  | 'カフェ'
  | 'カレー'
  | 'レストラン'
  | 'ホテル'
  | '和食・精進'
  | 'マクロビ・オーガニック'
  | '中華・台湾素食'
  | 'イタリアン・ピザ'
  | '居酒屋・バー';

export interface VeganRestaurantItem {
  id: string;
  name: string;
  instagram_id: string;
  instagram_url: string;
  genre: VeganGenre;
  area: string;
  prefecture: string;
  profile_text: string;
  features: string[];
}

export const VEGAN_RESTAURANTS_MASTER: VeganRestaurantItem[] = [
  // ============================================================
  // 🍜 ラーメン（50店舗）
  // ============================================================
  {
    id: 'vegan-ramen-01',
    name: 'Vegan Ramen YADOKARI',
    instagram_id: '@vegan.halalramen__yadokari',
    instagram_url: 'https://www.instagram.com/vegan.halalramen__yadokari',
    genre: 'ラーメン',
    area: '福岡市平尾',
    prefecture: '福岡県',
    profile_text: '福岡市中央区平尾の100%植物性ヴィーガンラーメン専門店。五葷不使用・グルテンフリー麺対応。ヴィーガン餃子や野菜寿司も展開しインバウンド旅行客から大絶賛。',
    features: ['100%植物性', '五葷不使用', 'グルテンフリー対応', 'インバウンド人気']
  },
  {
    id: 'vegan-ramen-02',
    name: '鮨しま（ヴィーガン豚骨風ラーメン）',
    instagram_id: '@sushi_shima_fukuoka',
    instagram_url: 'https://www.instagram.com/sushi_shima_fukuoka',
    genre: 'ラーメン',
    area: '福岡市港',
    prefecture: '福岡県',
    profile_text: '福岡市中央区港の鮨名店がランチ限定で仕込む話題の「ヴィーガンOK濃厚豚骨風ラーメン」。豆乳と香味野菜の極上出汁で外国人客やヴィーガンが殺到。',
    features: ['ランチ限定', '豚骨風極上スープ', '要予約名店', '豆乳ベース']
  },
  {
    id: 'vegan-ramen-03',
    name: 'BUGORO ALL VEGAN',
    instagram_id: '@bugoro_all_vegan',
    instagram_url: 'https://www.instagram.com/bugoro_all_vegan',
    genre: 'ラーメン',
    area: '福岡市古民家',
    prefecture: '福岡県',
    profile_text: '福岡の古民家ヴィーガンラーメン＆カフェ。博多風ヴィーガンラーメンやヴィーガン担々麺を提供。こだわりの食後デザート需要が高い。',
    features: ['古民家カフェ', '博多風ヴィーガン', '担々麺', 'デザート親和性◎']
  },
  {
    id: 'vegan-ramen-04',
    name: 'veggie食堂 船出屋',
    instagram_id: '@funadeya',
    instagram_url: 'https://www.instagram.com/funadeya',
    genre: 'ラーメン',
    area: '古賀市',
    prefecture: '福岡県',
    profile_text: '福岡県古賀市のオーガニック＆ヴィーガン食堂。完全植物性の特製ヴィーガンラーメンや薬膳麺、アレルギー対応スイーツを展開。',
    features: ['オーガニック', '薬膳ラーメン', '無農薬野菜', 'アレルギー対応']
  },
  {
    id: 'vegan-ramen-05',
    name: '博多拉担麺 まるたん 天神店',
    instagram_id: '@marutan_official',
    instagram_url: 'https://www.instagram.com/marutan_official',
    genre: 'ラーメン',
    area: '福岡市天神',
    prefecture: '福岡県',
    profile_text: '福岡・天神で話題の植物性100%スープ「ビーガンラータンメン」。大豆ミートと胡麻香るスープでヘルシー志向客・訪日外国人を集客。',
    features: ['天神中心地', '大豆ミート', '胡麻濃厚スープ', 'ビーガンラータンメン']
  },
  {
    id: 'vegan-ramen-06',
    name: 'Rota Cafe 大名店',
    instagram_id: '@rotacafe_fukuoka',
    instagram_url: 'https://www.instagram.com/rotacafe_fukuoka',
    genre: 'ラーメン',
    area: '福岡市大名',
    prefecture: '福岡県',
    profile_text: '福岡大名のヴィーガン・マクロビ名店。グルテンフリーの特製ヴィーガン麺メニューを展開。アイス・スイーツとの親和性が極めて高い。',
    features: ['福岡大名', 'グルテンフリー麺', 'マクロビ名店', 'スイーツ大人気']
  },
  {
    id: 'vegan-ramen-07',
    name: 'MERCY Vegan Ramen',
    instagram_id: '@mercyveganramen',
    instagram_url: 'https://www.instagram.com/mercyveganramen',
    genre: 'ラーメン',
    area: '大阪市博労町',
    prefecture: '大阪府',
    profile_text: '大阪・本町/心斎橋エリアのヴィーガンラーメン専門店。米粉特製麺によるグルテンフリー＆100%植物性ラーメン。外国人客比率90%以上。',
    features: ['大阪初の専門店', '米粉麺グルテンフリー', 'インバウンド大行列']
  },
  {
    id: 'vegan-ramen-08',
    name: 'The Fire Vegan Osaka',
    instagram_id: '@the_fire_vegan_osaka',
    instagram_url: 'https://www.instagram.com/the_fire_vegan_osaka',
    genre: 'ラーメン',
    area: '大阪市心斎橋',
    prefecture: '大阪府',
    profile_text: '大阪心斎橋のヴィーガンラーメン＆ダイナー。ヴィーガンとんこつラーメンや餃子を提供。ナイトタイムのデザート注文需要大。',
    features: ['心斎橋繁華街', 'ヴィーガン豚骨', 'ダイナースタイル']
  },
  {
    id: 'vegan-ramen-09',
    name: 'ベジラーメンゆにわ',
    instagram_id: '@vege_yuniwa',
    instagram_url: 'https://www.instagram.com/vege_yuniwa',
    genre: 'ラーメン',
    area: '枚方市楠葉',
    prefecture: '大阪府',
    profile_text: '日本初のヴィーガンラーメン専門店の草分け。10種以上の厳選野菜と無化調出汁による至高のプラントベースラーメンを提供。',
    features: ['元祖ヴィーガンラーメン', '厳選10種野菜', '無添加無化調']
  },
  {
    id: 'vegan-ramen-10',
    name: 'パプリカ食堂ヴィーガン',
    instagram_id: '@papurika_vegan',
    instagram_url: 'https://www.instagram.com/papurika_vegan',
    genre: 'ラーメン',
    area: '大阪市四ツ橋',
    prefecture: '大阪府',
    profile_text: '関西を代表するヴィーガンレストラン。特製ヴィーガンラーメンや担々麺、オーガニックヴィーガンスイーツをラインナップ。',
    features: ['関西屈指の知名度', '特製ヴィーガン麺', 'オーガニック']
  },
  {
    id: 'vegan-ramen-11',
    name: 'Vegan Ramen UZU KYOTO',
    instagram_id: '@veganramen_uzu_kyoto',
    instagram_url: 'https://www.instagram.com/veganramen_uzu_kyoto',
    genre: 'ラーメン',
    area: '京都市役所前',
    prefecture: '京都府',
    profile_text: 'チームラボのアート空間と融合したミシュランガイド掲載のヴィーガンラーメン名店。完全植物性の一杯に世界中から予約殺到。',
    features: ['ミシュラン掲載', 'チームラボ空間', '世界的話題店']
  },
  {
    id: 'vegan-ramen-12',
    name: '京都 豆乳ラーメン 豆禅（Towazen）',
    instagram_id: '@towazen_ramen',
    instagram_url: 'https://www.instagram.com/towazen_ramen',
    genre: 'ラーメン',
    area: '京都市下鴨',
    prefecture: '京都府',
    profile_text: '京都・下鴨のヴィーガン豆乳ラーメン専門店。自家製濃厚豆乳スープと京湯葉を使用。欧米豪のヴィーガン観光客が必ず訪れる聖地。',
    features: ['京都下鴨', '濃厚豆乳スープ', '京湯葉使用', '海外客殺到']
  },
  {
    id: 'vegan-ramen-13',
    name: 'Vegan Ramen Peace 京都河原町',
    instagram_id: '@peace_ramen_kyoto',
    instagram_url: 'https://www.instagram.com/peace_ramen_kyoto',
    genre: 'ラーメン',
    area: '京都市河原町',
    prefecture: '京都府',
    profile_text: '京都四条河原町の完全植物性ラーメン店。ヴィーガン醤油・味噌・担々麺を提供。海外ツーリストの食後スイーツ需要が旺盛。',
    features: ['河原町中心部', '100%植物性', 'インバウンド95%']
  },
  {
    id: 'vegan-ramen-14',
    name: 'Engine Ramen',
    instagram_id: '@engine_ramen',
    instagram_url: 'https://www.instagram.com/engine_ramen',
    genre: 'ラーメン',
    area: '京都市河原町',
    prefecture: '京都府',
    profile_text: '京都・河原町の野菜ポタージュ系ヴィーガンラーメン店。グルテンフリー対応麺も完備し外国人客で連日満席。',
    features: ['濃厚野菜ポタージュ', 'グルテンフリー麺完備']
  },
  {
    id: 'vegan-ramen-15',
    name: 'UNO RAMEN',
    instagram_id: '@unoyukijp',
    instagram_url: 'https://www.instagram.com/unoyukijp',
    genre: 'ラーメン',
    area: '京都市',
    prefecture: '京都府',
    profile_text: '身体に優しい豆乳ベースのヴィーガン＆グルテンフリーラーメン専門店。クリーンな一杯とお口直しデザートの相乗効果抜群。',
    features: ['豆乳ラーメン', 'グルテンフリー', '健康志向']
  },
  {
    id: 'vegan-ramen-16',
    name: 'T\'sたんたん（東京駅・上野・池袋）',
    instagram_id: '@ts_tantan_jp',
    instagram_url: 'https://www.instagram.com/ts_tantan_jp',
    genre: 'ラーメン',
    area: '東京駅構内ほか',
    prefecture: '東京都',
    profile_text: '東京駅・上野駅・池袋等に展開する日本初のヴィーガン担々麺専門店。肉・魚介・卵・乳製品不使用。インバウンド客から圧倒的人気。',
    features: ['駅ナカ展開', 'ヴィーガン担々麺元祖', 'インバウンド客殺到']
  },
  {
    id: 'vegan-ramen-17',
    name: 'ソラノイロ（SORANOIRO 麹町・東京駅）',
    instagram_id: '@soranoiro.vege',
    instagram_url: 'https://www.instagram.com/soranoiro.vege',
    genre: 'ラーメン',
    area: '千代田区麹町',
    prefecture: '東京都',
    profile_text: 'ミシュラン・ビブグルマン獲得店。元祖「ベジソバ」や完全ヴィーガン・グルテンフリーラーメンのパイオニア。食後のアイス需要大。',
    features: ['ミシュラン獲得', '元祖ベジソバ', 'グルテンフリー対応']
  },
  {
    id: 'vegan-ramen-18',
    name: 'Tokyo Vegan Ramen Center',
    instagram_id: '@tokyo.vegan.ramen.center',
    instagram_url: 'https://www.instagram.com/tokyo.vegan.ramen.center',
    genre: 'ラーメン',
    area: '渋谷区原宿',
    prefecture: '東京都',
    profile_text: '原宿に位置する100%ヴィーガンラーメン専門店。フォトジェニックなヴィーガンラーメンで海外SNSで爆発的拡散。',
    features: ['原宿最新スポット', '100%ヴィーガン', 'SNS話題']
  },
  {
    id: 'vegan-ramen-19',
    name: '九州じゃんがら（原宿・秋葉原・銀座）',
    instagram_id: '@kyushujangara',
    instagram_url: 'https://www.instagram.com/kyushujangara',
    genre: 'ラーメン',
    area: '原宿・秋葉原',
    prefecture: '東京都',
    profile_text: '東京の有名豚骨ラーメン店が本気で開発した完全植物性「ヴィーガンこぼんしゃん」「からぼん」。外国人客多数来店。',
    features: ['植物性こぼんしゃん', '豚骨完全再現', 'インバウンド大人気']
  },
  {
    id: 'vegan-ramen-20',
    name: '菜道（SAIDO 自由が丘）',
    instagram_id: '@saido_tokyo',
    instagram_url: 'https://www.instagram.com/saido_tokyo',
    genre: 'ラーメン',
    area: '目黒区自由が丘',
    prefecture: '東京都',
    profile_text: '世界一のヴィーガンレストランに選出（HappyCow世界第1位）。特製ヴィーガンラーメン・まぜそばを提供。外国人客比率90%以上。',
    features: ['世界ランキング1位', 'ヴィーガンまぜそば', '欧米VIP御用達']
  },
  {
    id: 'vegan-ramen-21',
    name: '薬膳食堂ちゃぶ屋',
    instagram_id: '@chabuzen',
    instagram_url: 'https://www.instagram.com/chabuzen',
    genre: 'ラーメン',
    area: '世田谷区下北沢',
    prefecture: '東京都',
    profile_text: '完全ヴィーガン＆オーガニックラーメン店。グルテンフリー麺・無化調薬膳スープが欧米ヴィーガン客から熱狂的人気。',
    features: ['下北沢カルチャー', '完全無化調薬膳', 'オーガニック']
  },
  {
    id: 'vegan-ramen-22',
    name: '麺屋 帆のる（Honolu 日本橋・浅草）',
    instagram_id: '@halal_vegan_ramen_honolu',
    instagram_url: 'https://www.instagram.com/halal_vegan_ramen_honolu',
    genre: 'ラーメン',
    area: '中央区日本橋',
    prefecture: '東京都',
    profile_text: 'ハラール＆完全ヴィーガン認証ラーメン店。特製濃厚野菜ポタージュスープで海外ムスリム・ヴィーガンから絶大な信頼。',
    features: ['ハラール＆ヴィーガン', '濃厚野菜ポタージュ', '海外観光客必訪']
  },
  {
    id: 'vegan-ramen-23',
    name: 'AFURI（阿夫利 恵比寿・原宿・六本木）',
    instagram_id: '@afuri_japan',
    instagram_url: 'https://www.instagram.com/afuri_japan',
    genre: 'ラーメン',
    area: '恵比寿・六本木',
    prefecture: '東京都',
    profile_text: '厳選野菜をふんだんに使った彩りヴィーガンらーめんをグローバル展開。スタイリッシュな空間とヘルシー志向層にマッチ。',
    features: ['彩りヴィーガンらーめん', '洗練された空間', '海外展開ブランド']
  },
  {
    id: 'vegan-ramen-24',
    name: '麺匠 真武咲弥 渋谷店',
    instagram_id: '@samuraisakuta',
    instagram_url: 'https://www.instagram.com/samuraisakuta',
    genre: 'ラーメン',
    area: '渋谷区道玄坂',
    prefecture: '東京都',
    profile_text: '渋谷道玄坂の炙り味噌ラーメン店が開発した本格「ヴィーガン味噌ラーメン」。香ばしい味噌と植物性スープで海外客が大行列。',
    features: ['炙り味噌ヴィーガン', '渋谷道玄坂', '濃厚香ばしさ']
  },
  {
    id: 'vegan-ramen-25',
    name: 'Loving Hut 神保町',
    instagram_id: '@lovinghut_japan',
    instagram_url: 'https://www.instagram.com/lovinghut_japan',
    genre: 'ラーメン',
    area: '千代田区神保町',
    prefecture: '東京都',
    profile_text: '神保町の老舗ヴィーガンレストラン。100%植物性のヴィーガンラーメン・冷やし中華・スイーツを提供。',
    features: ['老舗ヴィーガン', '100%植物性ラーメン', '自家製デザート']
  },
  {
    id: 'vegan-ramen-26',
    name: 'CHABUTON（ちゃぶとん 秋葉原等）',
    instagram_id: '@chabuton_official',
    instagram_url: 'https://www.instagram.com/chabuton_official',
    genre: 'ラーメン',
    area: '千代田区秋葉原',
    prefecture: '東京都',
    profile_text: 'ミシュラン一つ星シェフ監修の「新ベジラーメン」。野菜の旨味だけで濃厚なコクを引き出したヴィーガンラーメンを展開。',
    features: ['ミシュランシェフ監修', '新ベジラーメン', '秋葉原ヨドバシ']
  },
  {
    id: 'vegan-ramen-27',
    name: 'むぎとオリーブ 銀座店',
    instagram_id: '@mugi_to_olive',
    instagram_url: 'https://www.instagram.com/mugi_to_olive',
    genre: 'ラーメン',
    area: '中央区銀座',
    prefecture: '東京都',
    profile_text: '銀座のミシュランビブグルマン掲載店。野菜出汁を極めたベジSOBAやヘルシーラーメンを提供。',
    features: ['銀座一等地', 'ミシュラン掲載', '野菜出汁SOBA']
  },
  {
    id: 'vegan-ramen-28',
    name: '一風堂 プラントベース（ルミネエスト新宿）',
    instagram_id: '@ippudo_jp',
    instagram_url: 'https://www.instagram.com/ippudo_jp',
    genre: 'ラーメン',
    area: '新宿区ルミネ',
    prefecture: '東京都',
    profile_text: '博多一風堂が本気で開発した「プラントベース赤丸・白丸」。豚骨不使用ながら豆乳出汁でコクを完全再現。',
    features: ['プラントベース赤丸', '豆乳仕立て', 'ルミネエスト新宿']
  },
  {
    id: 'vegan-ramen-29',
    name: '新横浜ラーメン博物館（ベジラーメン各店）',
    instagram_id: '@ramenmuseum',
    instagram_url: 'https://www.instagram.com/ramenmuseum',
    genre: 'ラーメン',
    area: '横浜市新横浜',
    prefecture: '神奈川県',
    profile_text: '新横浜ラーメン博物館では各名店がヴィーガン対応ラーメンを開発・提供中。国内外のラーメンファンが集まる拠点。',
    features: ['ラーメンの殿堂', '複数店ベジ対応', '外国人観光客殺到']
  },
  {
    id: 'vegan-ramen-30',
    name: '麻心（まごころ 鎌倉・由比ヶ浜）',
    instagram_id: '@magokoro_kamakura',
    instagram_url: 'https://www.instagram.com/magokoro_kamakura',
    genre: 'ラーメン',
    area: '鎌倉市由比ヶ浜',
    prefecture: '神奈川県',
    profile_text: '鎌倉由比ヶ浜のオーガニックカフェレストラン。麻の実を使用した特製ヴィーガンラーメン・麺料理を提供。',
    features: ['湘南由比ヶ浜', '麻の実（ヘンプ）', 'オーガニック麺']
  },
  {
    id: 'vegan-ramen-31',
    name: 'Vegan Ramen めぐり（北海道旭川）',
    instagram_id: '@vegan_ramen_meguri',
    instagram_url: 'https://www.instagram.com/vegan_ramen_meguri',
    genre: 'ラーメン',
    area: '旭川市',
    prefecture: '北海道',
    profile_text: '旭川唯一の完全ヴィーガンラーメン専門店。地元有機野菜と北海道産小麦を使用した絶品ラーメンを提供。',
    features: ['北海道旭川唯一', '道産小麦100%', '地元有機野菜']
  },
  {
    id: 'vegan-ramen-32',
    name: '一粒庵（いちりゅうあん 札幌駅前）',
    instagram_id: '@ichiryuan_sapporo',
    instagram_url: 'https://www.instagram.com/ichiryuan_sapporo',
    genre: 'ラーメン',
    area: '札幌市中央区',
    prefecture: '北海道',
    profile_text: '札幌駅前のミシュラン掲載名店。完全植物性・ヴィーガン対応の味噌ラーメンを開発。観光客から高評価。',
    features: ['ミシュラン掲載', '札幌味噌ヴィーガン', '駅前立地']
  },
  {
    id: 'vegan-ramen-33',
    name: 'ベジキッチン・グーグー',
    instagram_id: '@vegikitchen_gugu',
    instagram_url: 'https://www.instagram.com/vegikitchen_gugu',
    genre: 'ラーメン',
    area: '名古屋市千種区',
    prefecture: '愛知県',
    profile_text: '名古屋市千種区のヴィーガン＆グルテンフリー店。名物のヴィーガン台湾まぜそばやラーメンが人気。スイーツ需要大。',
    features: ['ヴィーガン台湾まぜそば', 'グルテンフリー', '名古屋人気店']
  },
  {
    id: 'vegan-ramen-34',
    name: 'nico.chan',
    instagram_id: '@nico.chan_0725',
    instagram_url: 'https://www.instagram.com/nico.chan_0725',
    genre: 'ラーメン',
    area: 'あま市',
    prefecture: '愛知県',
    profile_text: '愛知県あま市のオーガニック自然食カフェ。植物性のヴィーガン麺メニューを展開し地元健康志向層に愛される。',
    features: ['自然食オーガニック', '身体に優しい麺', 'アットホーム']
  },
  {
    id: 'vegan-ramen-35',
    name: '銀座 篝 JRゲートタワー名古屋店',
    instagram_id: '@ginza_kagari',
    instagram_url: 'https://www.instagram.com/ginza_kagari',
    genre: 'ラーメン',
    area: '名古屋駅名駅',
    prefecture: '愛知県',
    profile_text: '名古屋駅直結。極上野菜ポタージュで仕立てたヴィーガンSobaを提供。インバウンド客の人気スポット。',
    features: ['名駅直結', '極上野菜ポタージュ', '銀座篝クオリティ']
  },
  {
    id: 'vegan-ramen-36',
    name: 'TACO SUKEROKU / VEGAN RAMEN',
    instagram_id: '@taco_sukeroku',
    instagram_url: 'https://www.instagram.com/taco_sukeroku',
    genre: 'ラーメン',
    area: '広島市',
    prefecture: '広島県',
    profile_text: '広島市内のヴィーガンラーメン店。完全植物性の尾道風ヴィーガンラーメンを提供し海外バックパッカーで賑わう。',
    features: ['広島市内', '尾道風植物性ラーメン', 'バックパッカー人気']
  },
  {
    id: 'vegan-ramen-37',
    name: '我馬（GABA 広島）',
    instagram_id: '@gaba_ramen',
    instagram_url: 'https://www.instagram.com/gaba_ramen',
    genre: 'ラーメン',
    area: '広島市中区',
    prefecture: '広島県',
    profile_text: '広島の人気ラーメンチェーンが展開するプラントベースヴィーガンラーメン。平和記念公園周辺の観光客に大好評。',
    features: ['広島人気チェーン', 'プラントベース麺', '平和公園周辺']
  },
  {
    id: 'vegan-ramen-38',
    name: 'Cafe&Bar Gajimaru',
    instagram_id: '@gajimaru_plantbased',
    instagram_url: 'https://www.instagram.com/gajimaru_plantbased',
    genre: 'ラーメン',
    area: '国頭郡恩納村',
    prefecture: '沖縄県',
    profile_text: '沖縄・恩納村のヴィーガンレストラン。特製ヴィーガンラーメン、スパイシー麺、餃子を展開。グルテンフリー対応。',
    features: ['恩納村リゾート', 'スパイシーヴィーガン', 'グルテンフリー対応']
  },
  {
    id: 'vegan-ramen-39',
    name: '麺神まるよし 読谷店',
    instagram_id: '@veganramen.maruyoshi',
    instagram_url: 'https://www.instagram.com/veganramen.maruyoshi',
    genre: 'ラーメン',
    area: '中頭郡読谷村',
    prefecture: '沖縄県',
    profile_text: '沖縄県読谷村のヴィーガンラーメン提供店。トリュフ香るヴィーガンラーメンが海外リゾート客に大人気。',
    features: ['読谷リゾート', 'トリュフヴィーガンラーメン', '欧米客多数']
  },
  {
    id: 'vegan-ramen-40',
    name: 'オレンジ食堂（金武町）',
    instagram_id: '@orange_shokudo_okinawa',
    instagram_url: 'https://www.instagram.com/orange_shokudo_okinawa',
    genre: 'ラーメン',
    area: '国頭郡金武町',
    prefecture: '沖縄県',
    profile_text: '沖縄県金武町の完全植物性食堂。動物性食材不使用の「黒ごま濃厚ヴィーガン担々麺」が名物。',
    features: ['黒ごま濃厚担々麺', '動物性不使用', 'ローカル名店']
  },
  {
    id: 'vegan-ramen-41',
    name: 'ソラノイロ OKINAWA（那覇・国際通り）',
    instagram_id: '@soranoiro_okinawa',
    instagram_url: 'https://www.instagram.com/soranoiro_okinawa',
    genre: 'ラーメン',
    area: '那覇市国際通り',
    prefecture: '沖縄県',
    profile_text: '那覇国際通り・のれん街店。沖縄限定のヴィーガン担々麺やベジソバを展開。観光客・地元客で賑わう。',
    features: ['国際通りすぐ', '沖縄限定ベジソバ', '年中無休']
  },
  {
    id: 'vegan-ramen-42',
    name: '采菜 AYASAI（京都二条・京町家ヴィーガンラーメン）',
    instagram_id: '@ayasai_kyoto',
    instagram_url: 'https://www.instagram.com/ayasai_kyoto',
    genre: 'ラーメン',
    area: '京都市中京区二条',
    prefecture: '京都府',
    profile_text: '二条城近くの京町家で提供される特製野菜出汁・豆乳ベースの完全菜食ラーメン。グルテンフリー麺対応。',
    features: ['京町家', '豆乳スープ', 'グルテンフリー対応', '二条城近く']
  },
  {
    id: 'vegan-ramen-43',
    name: 'Vegans Cafe and Restaurant（伏見稲荷）',
    instagram_id: '@veganscafe',
    instagram_url: 'https://www.instagram.com/veganscafe',
    genre: 'ラーメン',
    area: '京都市伏見区深草',
    prefecture: '京都府',
    profile_text: '伏見稲荷の有名老舗ヴィーガン店。濃厚味噌ヴィーガンラーメンや炭火焼風丼、スイーツがインバウンド客に大人気。',
    features: ['伏見稲荷', '濃厚味噌ラーメン', '老舗ヴィーガン', '外国人観光客多数']
  },
  {
    id: 'vegan-ramen-44',
    name: 'キッチンのぎ（沖縄市マクロビ・ヴィーガン麺）',
    instagram_id: '@kitchen_nogi',
    instagram_url: 'https://www.instagram.com/kitchen_nogi',
    genre: 'ラーメン',
    area: '沖縄市中央',
    prefecture: '沖縄県',
    profile_text: '無添加・マクロビオティック仕込みのヴィーガンラーメンや沖縄そば。白砂糖・化学調味料一切不使用。',
    features: ['無添加マクロビ', 'ヴィーガンラーメン', '白砂糖不使用', '沖縄市']
  },
  {
    id: 'vegan-ramen-45',
    name: '台湾ベジーキッチン 楽膳（大阪東三国）',
    instagram_id: '@rakuzen_vegan',
    instagram_url: 'https://www.instagram.com/rakuzen_vegan',
    genre: 'ラーメン',
    area: '大阪市淀川区東三国',
    prefecture: '大阪府',
    profile_text: '台湾素食の本格薬膳ヴィーガンラーメン＆豆乳タンタン麺。五葷抜き・オリエンタルヴィーガン完全対応。',
    features: ['台湾素食', '薬膳タンタン麺', '五葷抜き対応', '東三国']
  },
  {
    id: 'vegan-ramen-46',
    name: 'UNTAPPED Breakfast&Pub（札幌北18条）',
    instagram_id: '@untappedhostel',
    instagram_url: 'https://www.instagram.com/untappedhostel',
    genre: 'ラーメン',
    area: '札幌市北区北18条',
    prefecture: '北海道',
    profile_text: '自家製昆布・椎茸出汁のヴィーガンヌードルとスパイス料理。ゲストハウス併設で多国籍なヴィーガン旅行者が集う。',
    features: ['札幌ゲストハウス', '和出汁ヴィーガン麺', '多国籍', '北18条']
  },
  {
    id: 'vegan-ramen-47',
    name: 'Green Soba Bar Niseko（北海道ニセコ）',
    instagram_id: '@greensobabar',
    instagram_url: 'https://www.instagram.com/greensobabar',
    genre: 'ラーメン',
    area: '虻田郡倶知安町',
    prefecture: '北海道',
    profile_text: '外国人スキー客で賑わうヴィーガン十割蕎麦＆プラントベース麺スタンド。濃厚な植物性出汁と食後デザートが人気。',
    features: ['ニセコ国際リゾート', 'ヴィーガン十割蕎麦', '富裕層インバウンド', 'プラントベース出汁']
  },
  {
    id: 'vegan-ramen-48',
    name: 'ナチュラルトーン（沖縄宜野湾・ヴィーガン沖縄そば）',
    instagram_id: '@naturaltone_okinawa',
    instagram_url: 'https://www.instagram.com/naturaltone_okinawa',
    genre: 'ラーメン',
    area: '宜野湾市大山',
    prefecture: '沖縄県',
    profile_text: '日本唯一の100%植物性ヴィーガン沖縄そば専門店。自家製植物性スープと有機小麦麺。',
    features: ['100%植物性', 'ヴィーガン沖縄そば', '宜野湾', '自然栽培']
  },
  {
    id: 'vegan-ramen-49',
    name: '薬膳拉麺 ドラゴン（東京上野）',
    instagram_id: '@yakuzen_dragon',
    instagram_url: 'https://www.instagram.com/yakuzen_dragon',
    genre: 'ラーメン',
    area: '台東区上野',
    prefecture: '東京都',
    profile_text: '漢方生薬と豆乳仕立ての完全植物性薬膳ヴィーガン拉麺。上野観光の外国人旅行者から大評判。',
    features: ['上野名所', '薬膳拉麺', '豆乳スープ', '完全植物性']
  },
  {
    id: 'vegan-ramen-50',
    name: '菜食Ken（東京西葛西）',
    instagram_id: '@saishoku_ken',
    instagram_url: 'https://www.instagram.com/saishoku_ken',
    genre: 'ラーメン',
    area: '江戸川区西葛西',
    prefecture: '東京都',
    profile_text: '100%植物性のヴィーガン味噌ラーメンや担々麺を提供する菜食中華・ラーメン店。リピーター多数。',
    features: ['菜食中華', '植物性味噌ラーメン', '西葛西', 'リピーター多数']
  },
  // ============================================================
  // 🍔 バーガー＆ダイナー（25店舗）
  // ============================================================
  {
    id: 'vegan-burger-01',
    name: 'NICE plant-based cafe',
    instagram_id: '@nice_plantbased',
    instagram_url: 'https://www.instagram.com/nice_plantbased',
    genre: 'バーガー',
    area: '福岡市中央区警固',
    prefecture: '福岡県',
    profile_text: '福岡・警固の100%植物性カフェ。自家製パティと特製バンズを使った絶品アボカドチーズバーガーが大人気。スイーツとのセット率高。',
    features: ['福岡警固', '100%植物性パティ', 'アボカドチーズバーガー', 'デザート相乗効果']
  },
  {
    id: 'vegan-burger-02',
    name: 'Superiority Burger Japan',
    instagram_id: '@superiorityburgerjapan',
    instagram_url: 'https://www.instagram.com/superiorityburgerjapan',
    genre: 'バーガー',
    area: '世田谷区下北沢',
    prefecture: '東京都',
    profile_text: 'NYイーストビレッジ発、世界を熱狂させるヴィーガンバーガー店の下北沢店。ジェラート・アイスとのペアリングが定番。',
    features: ['NY発有名店', '下北沢', 'ジェラート好相性', '若年層・インバウンド']
  },
  {
    id: 'vegan-burger-03',
    name: 'TERRA BURGERS & BOWL',
    instagram_id: '@terraburgerandbowl',
    instagram_url: 'https://www.instagram.com/terraburgerandbowl',
    genre: 'バーガー',
    area: '渋谷区代官山',
    prefecture: '東京都',
    profile_text: '代官山のプレミアムヴィーガンバーガー専門店。ボリューム満点のグルメバーガーとシェイク・アイスの需要が絶大。',
    features: ['代官山一等地', '極厚パティ', 'グルメバーガー', '欧米客殺到']
  },
  {
    id: 'vegan-burger-04',
    name: 'GREAT LAKES',
    instagram_id: '@greatlakes_tokyo',
    instagram_url: 'https://www.instagram.com/greatlakes_tokyo',
    genre: 'バーガー',
    area: '新宿区高田馬場',
    prefecture: '東京都',
    profile_text: '高田馬場の完全植物性アメリカンクラフトバーガーダイナー。クラシックなバーガーセットとアイスクリームの相性抜群。',
    features: ['クラシックアメリカン', '完全植物性', 'バーガー×アイスセット']
  },
  {
    id: 'vegan-burger-05',
    name: 'AIN SOPH.ripple',
    instagram_id: '@ainsoph_ripple',
    instagram_url: 'https://www.instagram.com/ainsoph_ripple',
    genre: 'バーガー',
    area: '新宿区歌舞伎町',
    prefecture: '東京都',
    profile_text: '歌舞伎町の人気ヴィーガンバーガー専門店。ソイチキンバーガーやチーズバーガー、フライドポテトを提供。外国人客比率85%以上。',
    features: ['新宿歌舞伎町', 'ソイチキンバーガー', '外国人観光客大人気']
  },
  {
    id: 'vegan-burger-06',
    name: 'ALISHAN PARK',
    instagram_id: '@alishanpark',
    instagram_url: 'https://www.instagram.com/alishanpark',
    genre: 'バーガー',
    area: '渋谷区代々木公園',
    prefecture: '東京都',
    profile_text: '代々木公園そばのオーガニック＆ベジタリアンパークカフェ。ボリューム満点のヴィーガンバーガーやスイーツを展開。',
    features: ['代々木公園立地', 'オーガニック素材', 'ペット同伴・テラス']
  },
  {
    id: 'vegan-burger-07',
    name: 'Falafel Brothers',
    instagram_id: '@falafelbrotherstokyo',
    instagram_url: 'https://www.instagram.com/falafelbrotherstokyo',
    genre: 'バーガー',
    area: '六本木・渋谷',
    prefecture: '東京都',
    profile_text: '六本木・渋谷・原宿に展開するヴィーガンファストフード。ファラフェルバーガーやヴィーガンホットドッグが海外客に大ヒット。',
    features: ['六本木・渋谷', 'ファラフェルバーガー', 'カジュアルヴィーガン']
  },
  {
    id: 'vegan-burger-08',
    name: 'VEGAN BURG KITCHEN',
    instagram_id: '@vegan_burg_kitchen',
    instagram_url: 'https://www.instagram.com/vegan_burg_kitchen',
    genre: 'バーガー',
    area: '大阪市',
    prefecture: '大阪府',
    profile_text: '西日本初のヴィーガンバーガー専門店。素材に徹底的にこだわった手作りパティとバンズでリピーター多数。',
    features: ['西日本初の専門店', '自家製手作りパティ', '大阪ヴィーガン']
  },
  {
    id: 'vegan-burger-09',
    name: 'Vegginy',
    instagram_id: '@vegginykyoto',
    instagram_url: 'https://www.instagram.com/vegginykyoto',
    genre: 'バーガー',
    area: '京都市四条',
    prefecture: '京都府',
    profile_text: '京都四条エリアのヴィーガンバーガー店。ひよこ豆やきのこを贅沢に使った自家製パティが欧米旅行客から高評価。',
    features: ['京都四条', 'ひよこ豆パティ', '欧米トラベラー人気']
  },
  {
    id: 'vegan-burger-10',
    name: '六屯（ROTTON）',
    instagram_id: '@rotton8989',
    instagram_url: 'https://www.instagram.com/rotton8989',
    genre: 'バーガー',
    area: '中頭郡北谷町',
    prefecture: '沖縄県',
    profile_text: '沖縄・北谷アメリカンビレッジ近くのヴィーガン料理店。ボリュームあるヴィーガンバーガーを提供し米軍関係者・観光客に人気。',
    features: ['北谷リゾート', 'アメリカンボリューム', '基地関係者・外国人']
  },
  {
    id: 'vegan-burger-11',
    name: 'Earthful Burger',
    instagram_id: '@earthfulburger',
    instagram_url: 'https://www.instagram.com/earthfulburger',
    genre: 'バーガー',
    area: '国頭郡今帰仁村',
    prefecture: '沖縄県',
    profile_text: '沖縄・今帰仁村の自然の中にあるヴィーガンバーガー店。おからこんにゃくパティとやんばる無農薬野菜のバーガー。',
    features: ['やんばる自然派', 'おからこんにゃくパティ', '観光ドライブスポット']
  },
  {
    id: 'vegan-burger-12',
    name: '2foods 渋谷ロフト店',
    instagram_id: '@2foods.official',
    instagram_url: 'https://www.instagram.com/2foods.official',
    genre: 'バーガー',
    area: '渋谷区宇田川町',
    prefecture: '東京都',
    profile_text: '渋谷ロフト内の最新プラントベースカフェ。濃厚ヴィーガンチーズバーガーやプラントベーススイーツを多数展開。',
    features: ['渋谷ロフト内', '進化系プラントベース', '若年層・Z世代支持']
  },
  {
    id: 'vegan-burger-13',
    name: 'BLUE POINT FALAFEL & COFFEE（沖縄読谷村）',
    instagram_id: '@bluepoint_falafel',
    instagram_url: 'https://www.instagram.com/bluepoint_falafel',
    genre: 'バーガー',
    area: '中頭郡読谷村',
    prefecture: '沖縄県',
    profile_text: '海が目の前の100%ヴィーガンカフェ。特製ヘンプシードバーガーや揚げたてファラフェルサンドが人気。',
    features: ['読谷村オーシャンビュー', 'ヘンプバーガー', '100%ヴィーガン', 'ファラフェル']
  },
  {
    id: 'vegan-burger-14',
    name: 'base island kitchen（大阪中崎町）',
    instagram_id: '@baseislandkitchen',
    instagram_url: 'https://www.instagram.com/baseislandkitchen',
    genre: 'バーガー',
    area: '大阪市北区中崎町',
    prefecture: '大阪府',
    profile_text: '100%植物性のヴィーガンスマッシュバーガーとクラフトビール。外国人旅行者で賑わうアメリカンダイナー。',
    features: ['大阪中崎町', 'スマッシュバーガー', 'クラフトビール', 'オールプラントベース']
  },
  {
    id: 'vegan-burger-15',
    name: 'cafe pony（熊本市ヴィーガンカフェ）',
    instagram_id: '@cafepony_kumamoto',
    instagram_url: 'https://www.instagram.com/cafepony_kumamoto',
    genre: 'バーガー',
    area: '熊本市中央区',
    prefecture: '熊本県',
    profile_text: '熊本県産無農薬野菜と自家製大豆パティの手作りヴィーガンバーガー。スイーツ需要も極めて高い。',
    features: ['熊本市中心地', '無農薬野菜', '大豆パティ', '手作りスイーツ人気']
  },
  {
    id: 'vegan-burger-16',
    name: 'KOMEDA is □（東銀座）',
    instagram_id: '@komeda_is_square',
    instagram_url: 'https://www.instagram.com/komeda_is_square',
    genre: 'バーガー',
    area: '中央区銀座',
    prefecture: '東京都',
    profile_text: 'コメダ珈琲が手がける100%プラントベース喫茶。名物「べっぴんバーガー」や大豆ミートカツバーガーを展開。',
    features: ['東銀座', 'コメダ公式プラントベース', 'べっぴんバーガー', '話題性抜群']
  },
  {
    id: 'vegan-burger-17',
    name: 'Ballon Tokyo（中目黒）',
    instagram_id: '@ballon_tokyo',
    instagram_url: 'https://www.instagram.com/ballon_tokyo',
    genre: 'バーガー',
    area: '目黒区中目黒',
    prefecture: '東京都',
    profile_text: '100%ヴィーガンのファラフェルスタンド。豆乳ソフトクリームとバーガーの組み合わせが女性客に大人気。',
    features: ['中目黒', '100%ヴィーガン', 'ファラフェルサンド', '豆乳ソフト人気']
  },
  {
    id: 'vegan-burger-18',
    name: 'MR. FARMER 表参道本店',
    instagram_id: '@mr.farmer_',
    instagram_url: 'https://www.instagram.com/mr.farmer_',
    genre: 'バーガー',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: '自慢のプラントベースグルメバーガーやヴィーガンアボカドトーストを提供する人気カフェ。',
    features: ['表参道一等地', 'プラントベースバーガー', '契約農家野菜', 'トレンド発信地']
  },
  {
    id: 'vegan-burger-19',
    name: 'Organic Table by LAPAZ（外苑前）',
    instagram_id: '@lapaz_tokyo',
    instagram_url: 'https://www.instagram.com/lapaz_tokyo',
    genre: 'バーガー',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: '大豆ミートのジューシーなヴィーガンバーガーやプラントベーススイーツを提供するオーガニックダイナー。',
    features: ['外苑前・青山', '大豆ミートバーガー', 'オーガニック', '洗練された空間']
  },
  {
    id: 'vegan-burger-20',
    name: 'Plant More 新宿ルミネ',
    instagram_id: '@plantmore_official',
    instagram_url: 'https://www.instagram.com/plantmore_official',
    genre: 'バーガー',
    area: '新宿区西新宿',
    prefecture: '東京都',
    profile_text: '新宿駅直結のプラントベースダイナー。濃厚チーズ風ヴィーガンバーガーやグレインズボウルを展開。',
    features: ['新宿ルミネ直結', 'ヴィーガンバーガー', 'グレインズボウル', 'アクセス抜群']
  },
  {
    id: 'vegan-burger-21',
    name: 'MATSUONTOKO（京都新京極）',
    instagram_id: '@matsuontoko',
    instagram_url: 'https://www.instagram.com/matsuontoko',
    genre: 'バーガー',
    area: '京都市中京区新京極',
    prefecture: '京都府',
    profile_text: '京都新京極の有名ヴィーガンバーガー＆カフェ。ボリューミーなアボカドチーズバーガーや豆乳シェイク。',
    features: ['京都新京極', 'ヴィーガンバーガー専門店', '豆乳シェイク', '外国人行列店']
  },
  {
    id: 'vegan-burger-22',
    name: 'The Castle Kobe（神戸三宮）',
    instagram_id: '@thecastle_kobe',
    instagram_url: 'https://www.instagram.com/thecastle_kobe',
    genre: 'バーガー',
    area: '神戸市中央区中山手通',
    prefecture: '兵庫県',
    profile_text: '外国人客が集うヴィーガンバーガー＆プラントタコスダイナー。クラフトビールとデザートの組み合わせが人気。',
    features: ['神戸三宮', 'ヴィーガンバーガー', 'クラフトビール', '国際色豊か']
  },
  {
    id: 'vegan-burger-23',
    name: 'GOKAN Plant-based Diner（名古屋伏見）',
    instagram_id: '@gokan_diner',
    instagram_url: 'https://www.instagram.com/gokan_diner',
    genre: 'バーガー',
    area: '名古屋市中区錦',
    prefecture: '愛知県',
    profile_text: '地元愛知の有機野菜とオリジナル大豆パティのヴィーガンバーガー。カフェ利用も人気。',
    features: ['名古屋伏見', '愛知産有機野菜', '自家製バンズ', '大豆ミートパティ']
  },
  {
    id: 'vegan-burger-24',
    name: 'EARTHFUL CAFE Okinawa（沖縄糸満）',
    instagram_id: '@earthful_cafe',
    instagram_url: 'https://www.instagram.com/earthful_cafe',
    genre: 'バーガー',
    area: '糸満市西崎',
    prefecture: '沖縄県',
    profile_text: '海の見える100%ヴィーガンダイナー。ボリューム満点の特製ベジバーガーとスムージー。',
    features: ['沖縄糸満', 'オーシャンフロント', '100%植物性', 'ベジバーガー名店']
  },
  {
    id: 'vegan-burger-25',
    name: 'Kuumba du Falafel（渋谷神泉）',
    instagram_id: '@kuumbadufalafel',
    instagram_url: 'https://www.instagram.com/kuumbadufalafel',
    genre: 'バーガー',
    area: '目黒区青葉台',
    prefecture: '東京都',
    profile_text: '東京を代表する本場仕込みのファラフェルサンド専門店。香ばしいピタパンとひよこ豆コロッケ。',
    features: ['渋谷神泉', 'ファラフェルサンド名店', '本場イスラエル流', 'ヴィーガン定番']
  },
  // ============================================================
  // ☕ カフェ＆スイーツ（55店舗）
  // ============================================================
  {
    id: 'vegan-cafe-01',
    name: 'Sonu Sonu Vegan cafe & restaurant',
    instagram_id: '@sonusonu_fukuoka',
    instagram_url: 'https://www.instagram.com/sonusonu_fukuoka',
    genre: 'カフェ',
    area: '福岡市天神',
    prefecture: '福岡県',
    profile_text: '福岡・天神エリアの代表的ヴィーガンカフェ。植物性ランチプレートやギルトフリースイーツを提供し女性客・外国人客で賑わう。',
    features: ['福岡天神中心地', 'プラントベースランチ', 'スイーツ大人気']
  },
  {
    id: 'vegan-cafe-02',
    name: 'エヴァダイニング 博多リバレイン店',
    instagram_id: '@evahdaining',
    instagram_url: 'https://www.instagram.com/evahdaining',
    genre: 'カフェ',
    area: '福岡市博多',
    prefecture: '福岡県',
    profile_text: '博多リバレイン内のオーガニック＆マクロビオティックカフェレストラン。安心安全な植物性スイーツやデリを提供。',
    features: ['博多リバレイン直結', 'マクロビオティック', '無農薬野菜デリ']
  },
  {
    id: 'vegan-cafe-03',
    name: '喫茶 八猫（はちねこ）',
    instagram_id: '@kissa_hachineko',
    instagram_url: 'https://www.instagram.com/kissa_hachineko',
    genre: 'カフェ',
    area: '福岡市',
    prefecture: '福岡県',
    profile_text: '福岡市内の自然派喫茶。植物性素材にこだわったヴィーガンスイーツや薬膳チャイを提供し、静かに寛げる空間。',
    features: ['自然派喫茶', '植物性スイーツ', '薬膳チャイ']
  },
  {
    id: 'vegan-cafe-04',
    name: 'AIN SOPH. soars（アインソフ ソア 池袋）',
    instagram_id: '@ain_soph_soar',
    instagram_url: 'https://www.instagram.com/ain_soph_soar',
    genre: 'カフェ',
    area: '豊島区東池袋',
    prefecture: '東京都',
    profile_text: '完全植物性のヴィーガンレストラン＆パティスリー。グルテンフリーの「天上のヴィーガンパンケーキ」や豆乳アイスが名物。',
    features: ['ヴィーガンスイーツの聖地', '天上のヴィーガンパンケーキ', '池袋']
  },
  {
    id: 'vegan-cafe-05',
    name: 'AIN SOPH. Journey KYOTO',
    instagram_id: '@ainsoph.journey.kyoto',
    instagram_url: 'https://www.instagram.com/ainsoph.journey.kyoto',
    genre: 'カフェ',
    area: '京都市中京区',
    prefecture: '京都府',
    profile_text: '京都四条河原町のヴィーガンレストラン＆サロン。京都観光客に寄り添うヴィーガン抹茶パフェやパンケーキを提供。',
    features: ['京都四条河原町', '抹茶スイーツ', '海外トラベラー多数']
  },
  {
    id: 'vegan-cafe-06',
    name: 'WIRED BONBON',
    instagram_id: '@wired_bonbon',
    instagram_url: 'https://www.instagram.com/wired_bonbon',
    genre: 'カフェ',
    area: '新宿区ルミネ',
    prefecture: '東京都',
    profile_text: '新宿ルミネ内の100%植物性素材スイーツ専門店。豆乳や米粉を使ったギルトフリーパフェやヴィーガンソフトクリームが大ヒット。',
    features: ['新宿ルミネ1', '米粉・豆乳パフェ', 'ヴィーガンスイーツ専門']
  },
  {
    id: 'vegan-cafe-07',
    name: 'PARLOR 8ablish',
    instagram_id: '@8ablish',
    instagram_url: 'https://www.instagram.com/8ablish',
    genre: 'カフェ',
    area: '港区南青山',
    prefecture: '東京都',
    profile_text: '南青山のオーガニック＆ヴィーガンパティスリー。洗練されたヴィーガンアイス、焼き菓子、マフィンを展開する老舗ブランド。',
    features: ['南青山洗練ブランド', 'オーガニックヴィーガン', 'ギフト人気']
  },
  {
    id: 'vegan-cafe-08',
    name: 'ovgo Baker',
    instagram_id: '@ovgo_official',
    instagram_url: 'https://www.instagram.com/ovgo_official',
    genre: 'カフェ',
    area: '中央区日本橋',
    prefecture: '東京都',
    profile_text: '日本橋小伝馬町・原宿等の人気アメリカンベイクショップ。全て植物性・環境配慮素材のクッキーやマフィンが大人気。',
    features: ['全米大人気スタイル', '植物性アメリカンベイク', '若年層・インバウンド']
  },
  {
    id: 'vegan-cafe-09',
    name: 'POSH（ポッシュ 清澄白河）',
    instagram_id: '@posh_rawsweets',
    instagram_url: 'https://www.instagram.com/posh_rawsweets',
    genre: 'カフェ',
    area: '江東区清澄白河',
    prefecture: '東京都',
    profile_text: '清澄白河のロースイーツパティスリー。焼かないヴィーガンタルトや植物性ジェラートがSNSで大反響。',
    features: ['清澄白河カフェ街', 'ロースイーツ専門', '小麦・乳・卵不使用']
  },
  {
    id: 'vegan-cafe-10',
    name: 'Cosme Kitchen Adaptation 表参道',
    instagram_id: '@cosmekitchen_adaptation',
    instagram_url: 'https://www.instagram.com/cosmekitchen_adaptation',
    genre: 'カフェ',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: '表参道ヒルズ内のクリーンイーティングカフェ。オーガニック野菜とヴィーガンスイーツ・ソフトクリームを提供。',
    features: ['表参道ヒルズ', 'コスメキッチン直営', '美と健康テーマ']
  },
  {
    id: 'vegan-cafe-11',
    name: 'mumokuteki cafe 京都店',
    instagram_id: '@mumokuteki_cafe',
    instagram_url: 'https://www.instagram.com/mumokuteki_cafe',
    genre: 'カフェ',
    area: '京都市河原町',
    prefecture: '京都府',
    profile_text: '京都河原町の「いきるをつくる」ライフスタイルカフェ。お肉・卵・乳製品・白砂糖不使用のヴィーガンパフェ・ランチ。',
    features: ['京都四条河原町', '白砂糖不使用', '豆乳スイーツ多数']
  },
  {
    id: 'vegan-cafe-12',
    name: 'CHOICE（チョイス 京都三条）',
    instagram_id: '@choice_hs',
    instagram_url: 'https://www.instagram.com/choice_hs',
    genre: 'カフェ',
    area: '京都市三条',
    prefecture: '京都府',
    profile_text: '医師監修の完全プラントベース＆グルテンフリーカフェレストラン。ヴィーガンチーズケーキやアイスクリームを展開。',
    features: ['医師監修', 'プラントベースチーズ', '京都三条大橋そば']
  },
  {
    id: 'vegan-cafe-13',
    name: 'Cafe Matsuoka',
    instagram_id: '@cafematsuoka_kyoto',
    instagram_url: 'https://www.instagram.com/cafematsuoka_kyoto',
    genre: 'カフェ',
    area: '京都市左京区',
    prefecture: '京都府',
    profile_text: '京都・一乗寺の古民家ヴィーガンカフェ。落ち着いた和空間で手作りの植物性スイーツや珈琲を提供。',
    features: ['京都一乗寺', '古民家和カフェ', '手作りヴィーガンスイーツ']
  },
  {
    id: 'vegan-cafe-14',
    name: 'cafe Atl（カフェ アトル）',
    instagram_id: '@cafeatl',
    instagram_url: 'https://www.instagram.com/cafeatl',
    genre: 'カフェ',
    area: '大阪市心斎橋',
    prefecture: '大阪府',
    profile_text: '心斎橋のアメリカ村近くにあるオーガニック・ヴィーガンカフェ。無農薬野菜と自家製ヴィーガンスイーツを提供。',
    features: ['心斎橋アメ村', 'オーガニック野菜', '自家製ケーキ・アイス']
  },
  {
    id: 'vegan-cafe-15',
    name: 'カフェ プラントベイス',
    instagram_id: '@plantbased_osaka',
    instagram_url: 'https://www.instagram.com/plantbased_osaka',
    genre: 'カフェ',
    area: '大阪市西区',
    prefecture: '大阪府',
    profile_text: '大阪西区のプラントベーススイーツ専門店。乳卵不使用のパフェやアイスクリーム、米粉ケーキが人気。',
    features: ['プラントベースパフェ', '米粉スイーツ', 'アレルギー安心']
  },
  {
    id: 'vegan-cafe-16',
    name: '玄米カフェ 実身美 サンミ 心斎橋店',
    instagram_id: '@midorishokudo',
    instagram_url: 'https://www.instagram.com/midorishokudo',
    genre: 'カフェ',
    area: '大阪市心斎橋',
    prefecture: '大阪府',
    profile_text: '「食べることは生きること」がコンセプトの玄米カフェ。豆乳プリンやアレルギー配慮スイーツが女性層に絶大支持。',
    features: ['玄米カフェ草分け', '豆乳プリン名物', '女性・健康志向']
  },
  {
    id: 'vegan-cafe-17',
    name: '浮島ガーデン（那覇・国際通り）',
    instagram_id: '@ukishima_garden',
    instagram_url: 'https://www.instagram.com/ukishima_garden',
    genre: 'カフェ',
    area: '那覇市松尾',
    prefecture: '沖縄県',
    profile_text: '那覇の浮島通りにある島野菜×穀物菜食カフェレストラン。古民家で味わう沖縄産プラントベーススイーツが格別。',
    features: ['那覇浮島通り', '島野菜マクロビ', '古民家空間']
  },
  {
    id: 'vegan-cafe-18',
    name: '自然食カフェ めぶき',
    instagram_id: '@mebuki_okinawa',
    instagram_url: 'https://www.instagram.com/mebuki_okinawa',
    genre: 'カフェ',
    area: '中頭郡北谷町',
    prefecture: '沖縄県',
    profile_text: '沖縄北谷の自然食カフェ。地元無農薬フルーツを使ったヴィーガンスイーツや植物性アイスを海沿いで提供。',
    features: ['北谷海沿い', '無農薬フルーツ', 'オーガニックスイーツ']
  },
  {
    id: 'vegan-cafe-19',
    name: '自然食食堂 あぐり',
    instagram_id: '@agri_kanazawa',
    instagram_url: 'https://www.instagram.com/agri_kanazawa',
    genre: 'カフェ',
    area: '金沢市',
    prefecture: '石川県',
    profile_text: '金沢のオーガニック自然食カフェ食堂。加賀野菜を中心としたヴィーガンランチとアレルギー対応スイーツ。',
    features: ['金沢加賀野菜', '自然食食堂', 'アレルギー対応スイーツ']
  },
  {
    id: 'vegan-cafe-20',
    name: 'タルマーリー Talmary',
    instagram_id: '@talmary_tottori',
    instagram_url: 'https://www.instagram.com/talmary_tottori',
    genre: 'カフェ',
    area: '八頭郡智頭町',
    prefecture: '鳥取県',
    profile_text: '野生の菌でパンとクラフトビールを醸す全国的知名度のカフェ。ナチュラルなヴィーガンスイーツも展開。',
    features: ['全国的知名度', '野生の菌・天然酵母', '自然派クラフト']
  },
  {
    id: 'vegan-cafe-21',
    name: 'Salon de the Rima（葛飾区新小岩）',
    instagram_id: '@salon_de_the_rima',
    instagram_url: 'https://www.instagram.com/salon_de_the_rima',
    genre: 'カフェ',
    area: '葛飾区新小岩',
    prefecture: '東京都',
    profile_text: '無農薬玄米粉を使った100%グルテンフリー＆ヴィーガンのパティスリーカフェ。華やかな生ケーキ。',
    features: ['新小岩', '無農薬玄米粉', 'ヴィーガン生ケーキ', 'グルテンフリー']
  },
  {
    id: 'vegan-cafe-22',
    name: 'Universal Bakes and Cafe（世田谷代田）',
    instagram_id: '@universalbakes_tokyo',
    instagram_url: 'https://www.instagram.com/universalbakes_tokyo',
    genre: 'カフェ',
    area: '世田谷区代田',
    prefecture: '東京都',
    profile_text: '100%ヴィーガンのベーカリーカフェ。アイスや焼き菓子との相乗効果が抜群。',
    features: ['世田谷代田', '100%ヴィーガンベーカリー', '焼き菓子大人気', '下北沢隣接']
  },
  {
    id: 'vegan-cafe-23',
    name: 'Universal Bakes Nicome（下北沢）',
    instagram_id: '@universalbakes_nicome',
    instagram_url: 'https://www.instagram.com/universalbakes_nicome',
    genre: 'カフェ',
    area: '世田谷区北沢',
    prefecture: '東京都',
    profile_text: '下北沢BONUS TRACK近くのヴィーガン専門ベイクショップ＆カフェ。ドーナツやアイスが人気。',
    features: ['下北沢', 'ヴィーガンベイク', 'ドーナツ', '若者・外国人客多数']
  },
  {
    id: 'vegan-cafe-24',
    name: 'Hal Okada Vegan Sweets Lab（広尾）',
    instagram_id: '@halokada_vegansweetslab',
    instagram_url: 'https://www.instagram.com/halokada_vegansweetslab',
    genre: 'カフェ',
    area: '渋谷区広尾',
    prefecture: '東京都',
    profile_text: 'パティシエ岡田春生氏の100%ヴィーガンパティスリー。極上のショートケーキやロールケーキ。',
    features: ['広尾一等地', '岡田パティシエ', '100%ヴィーガン', '最高峰スイーツ']
  },
  {
    id: 'vegan-cafe-25',
    name: 'PQ\'s（浅草・ヴィーガンスパイス＆スイーツ）',
    instagram_id: '@pqs_curry',
    instagram_url: 'https://www.instagram.com/pqs_curry',
    genre: 'カフェ',
    area: '台東区鳥越',
    prefecture: '東京都',
    profile_text: 'アートのような色鮮やかなヴィーガンスイーツとスパイスカレーが人気のお洒落カフェ。',
    features: ['浅草・鳥越', 'アートヴィーガンスイーツ', 'スパイスカレー', '映えカフェ']
  },
  {
    id: 'vegan-cafe-26',
    name: 'The Farm Cafe（浅草・隅田川沿い）',
    instagram_id: '@thefarmcafe',
    instagram_url: 'https://www.instagram.com/thefarmcafe',
    genre: 'カフェ',
    area: '台東区花川戸',
    prefecture: '東京都',
    profile_text: '隅田川を望むテラス付き100%ヴィーガンカフェ。インバウンド旅行客で常に満席。',
    features: ['浅草リバーサイド', '100%ヴィーガン', 'テラス席', 'インバウンド大人気']
  },
  {
    id: 'vegan-cafe-27',
    name: 'Alaska Zwei（中目黒）',
    instagram_id: '@alaska_zwei',
    instagram_url: 'https://www.instagram.com/alaska_zwei',
    genre: 'カフェ',
    area: '目黒区東山',
    prefecture: '東京都',
    profile_text: '100%植物性の焼き菓子、スコーン、自家製パンとスープのカフェ。',
    features: ['中目黒', '100%植物性ベイク', 'スコーン', '居心地抜群']
  },
  {
    id: 'vegan-cafe-28',
    name: 'Te cor gentil（麻布十番）',
    instagram_id: '@te_cor_gentil',
    instagram_url: 'https://www.instagram.com/te_cor_gentil',
    genre: 'カフェ',
    area: '港区麻布十番',
    prefecture: '東京都',
    profile_text: 'フランス仕込みの高級ヴィーガンベーカリー＆カフェ。クロワッサンやデニッシュ。',
    features: ['麻布十番', '高級ヴィーガンベーカリー', 'クロワッサン', '手土産需要◎']
  },
  {
    id: 'vegan-cafe-29',
    name: 'HealthyTokyo Cafe & Shop 羽田空港',
    instagram_id: '@healthytokyo',
    instagram_url: 'https://www.instagram.com/healthytokyo',
    genre: 'カフェ',
    area: '大田区羽田空港',
    prefecture: '東京都',
    profile_text: '日本初の空港内ヴィーガンカフェ。外国人旅行者に大人気のヴィーガンチーズケーキやクッキー。',
    features: ['羽田空港第2ターミナル', '空港内ヴィーガン', 'チーズケーキ', '訪日客殺到']
  },
  {
    id: 'vegan-cafe-30',
    name: 'HealthyTokyo Cafe & Shop 代官山',
    instagram_id: '@healthytokyo_daikanyama',
    instagram_url: 'https://www.instagram.com/healthytokyo_daikanyama',
    genre: 'カフェ',
    area: '渋谷区代官山町',
    prefecture: '東京都',
    profile_text: '100%プラントベースのCBD＆オーガニックヴィーガンスイーツカフェ。',
    features: ['代官山', '100%プラントベース', 'CBDスイーツ', 'オーガニック']
  },
  {
    id: 'vegan-cafe-31',
    name: 'Tokyo Juice 表参道店',
    instagram_id: '@tokyojuice',
    instagram_url: 'https://www.instagram.com/tokyojuice',
    genre: 'カフェ',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: 'コールドプレスジュースとヴィーガンアサイーボウル専門店。海外セレブやモデル多数。',
    features: ['表参道', 'コールドプレスジュース', 'アサイーボウル', '外国人セレブ御用達']
  },
  {
    id: 'vegan-cafe-32',
    name: 'cafe letter（福岡糟屋郡久山町・Nayuta内）',
    instagram_id: '@cafe_letter_nayuta',
    instagram_url: 'https://www.instagram.com/cafe_letter_nayuta',
    genre: 'カフェ',
    area: '糟屋郡久山町久原',
    prefecture: '福岡県',
    profile_text: '久山町の広大な自然複合施設Nayutaの中で楽しむ極上ヴィーガンスイーツカフェ。',
    features: ['福岡久山Nayuta', '自然リゾート', 'ヴィーガンスイーツ', 'ドライブ名所']
  },
  {
    id: 'vegan-cafe-33',
    name: 'チャイナカフェ（福岡今泉）',
    instagram_id: '@chinacafe_fukuoka',
    instagram_url: 'https://www.instagram.com/chinacafe_fukuoka',
    genre: 'カフェ',
    area: '福岡市中央区今泉',
    prefecture: '福岡県',
    profile_text: '中国茶とヴィーガン薬膳スイーツ、豆花が人気のレトロモダンカフェ。大豆アイスとの親和性抜群。',
    features: ['福岡今泉', '薬膳スイーツ', '豆花', '女性客に大人気']
  },
  {
    id: 'vegan-cafe-34',
    name: '田田田堂 tatata-do（神戸御影）',
    instagram_id: '@tatatado_kobe',
    instagram_url: 'https://www.instagram.com/tatatado_kobe',
    genre: 'カフェ',
    area: '神戸市東灘区御影',
    prefecture: '兵庫県',
    profile_text: '乳・卵・小麦不使用のお米と豆のプラントベーススイーツ＆パティスリー。',
    features: ['神戸御影', 'お米のプラントベース', 'グルテンフリー', 'ハイセンスパティスリー']
  },
  {
    id: 'vegan-cafe-35',
    name: 'greenery（神戸北野町）',
    instagram_id: '@greenery_kobe',
    instagram_url: 'https://www.instagram.com/greenery_kobe',
    genre: 'カフェ',
    area: '神戸市中央区北野町',
    prefecture: '兵庫県',
    profile_text: '北野異人館街の100%プラントベースカフェ。スムージーボウルやスコーンが話題。',
    features: ['神戸北野異人館', '100%プラントベース', 'スムージーボウル', '外国人観光客多数']
  },
  {
    id: 'vegan-cafe-36',
    name: 'Modernark pharm cafe（神戸元町）',
    instagram_id: '@modernark_pharm_cafe',
    instagram_url: 'https://www.instagram.com/modernark_pharm_cafe',
    genre: 'カフェ',
    area: '神戸市中央区北長狭通',
    prefecture: '兵庫県',
    profile_text: '神戸トアロード近くで30年以上愛されるオーガニック＆ヴィーガンカフェの草分け。',
    features: ['神戸元町・トアロード', '30年の歴史', 'オーガニックケーキ', 'ヴィーガン名店']
  },
  {
    id: 'vegan-cafe-37',
    name: 'Yidaki Cafe（神戸元町）',
    instagram_id: '@yidakicafe',
    instagram_url: 'https://www.instagram.com/yidakicafe',
    genre: 'カフェ',
    area: '神戸市中央区三宮町',
    prefecture: '兵庫県',
    profile_text: 'オーストラリア仕込みのヴィーガン＆ヘルシーカフェ。身体に優しいヴィーガンボウルとスイーツ。',
    features: ['神戸元町', 'オーストラリアスタイル', 'ヴィーガンスイーツ', 'リラックス空間']
  },
  {
    id: 'vegan-cafe-38',
    name: 'TOSCA（京都北白川）',
    instagram_id: '@tosca_kyoto',
    instagram_url: 'https://www.instagram.com/tosca_kyoto',
    genre: 'カフェ',
    area: '京都市左京区北白川',
    prefecture: '京都府',
    profile_text: '京都大学・銀閣寺近くの自然食・ヴィーガンオーガニックカフェ。自家製マフィンやケーキ。',
    features: ['京都北白川', '銀閣寺近く', '自然食オーガニック', 'マフィン＆ケーキ']
  },
  {
    id: 'vegan-cafe-39',
    name: 'Organic Vegan Cafe morpho（京都堀川今出川）',
    instagram_id: '@cafe_morpho',
    instagram_url: 'https://www.instagram.com/cafe_morpho',
    genre: 'カフェ',
    area: '京都市上京区西町',
    prefecture: '京都府',
    profile_text: '100%ヴィーガンの老舗カフェ。ヴィーガンパフェやケーキ、豆乳スイーツが豊富。',
    features: ['京都堀川今出川', '100%ヴィーガン', 'パフェ＆サンデー', '老舗の名店']
  },
  {
    id: 'vegan-cafe-40',
    name: 'Premmarché Gelateria（京都三条会商店街）',
    instagram_id: '@premarche_gelateria',
    instagram_url: 'https://www.instagram.com/premarche_gelateria',
    genre: 'カフェ',
    area: '京都市中京区三条通',
    prefecture: '京都府',
    profile_text: 'イタリア国際ジェラート大会受賞の100%ヴィーガンジェラート専門店。',
    features: ['京都三条会商店街', 'イタリア国際受賞', '100%ヴィーガンジェラート', 'インバウンド行列']
  },
  {
    id: 'vegan-cafe-41',
    name: 'cafe planet（京都出町柳）',
    instagram_id: '@cafe_planet_kyoto',
    instagram_url: 'https://www.instagram.com/cafe_planet_kyoto',
    genre: 'カフェ',
    area: '京都市上京区出町柳',
    prefecture: '京都府',
    profile_text: '鴨川近くのプラントベースカフェ。豆乳ソフトやロースイーツが評判。',
    features: ['京都出町柳・鴨川', 'プラントベース', '豆乳ソフト', 'ロースイーツ']
  },
  {
    id: 'vegan-cafe-42',
    name: 'the kind CAFE（京都清水五条）',
    instagram_id: '@thekindcafe_kyoto',
    instagram_url: 'https://www.instagram.com/thekindcafe_kyoto',
    genre: 'カフェ',
    area: '京都市東山区清水',
    prefecture: '京都府',
    profile_text: '清水寺近くのスタイリッシュなヴィーガンスイーツカフェ。フルーツタルトやスムージー。',
    features: ['京都清水寺近く', 'スタイリッシュ空間', 'ヴィーガンスイーツ', '若者・外国人客']
  },
  {
    id: 'vegan-cafe-43',
    name: 'Veg Out（京都七条 鴨川沿い）',
    instagram_id: '@vegout_kyoto',
    instagram_url: 'https://www.instagram.com/vegout_kyoto',
    genre: 'カフェ',
    area: '京都市下京区七条通',
    prefecture: '京都府',
    profile_text: '鴨川を望むテラスが絶景の100%ヴィーガンカフェ。アイスやパフェ、マフィンが充実。',
    features: ['鴨川絶景ビュー', '100%ヴィーガン', 'パフェ＆スイーツ', '海外トラベラー多数']
  },
  {
    id: 'vegan-cafe-44',
    name: 'OPTIMAL CAFE（大阪南森町）',
    instagram_id: '@optimalcafe',
    instagram_url: 'https://www.instagram.com/optimalcafe',
    genre: 'カフェ',
    area: '大阪市北区南森町',
    prefecture: '大阪府',
    profile_text: '薬膳とヴィーガンスイーツを融合させたヘルシーカフェ。大豆アイスとの親和性◎。',
    features: ['大阪南森町', '薬膳ヴィーガン', 'ヘルシースイーツ', '身体に優しい']
  },
  {
    id: 'vegan-cafe-45',
    name: 'Megumi Cafe（大阪阿倍野天王寺）',
    instagram_id: '@megumi_cafe_vegan',
    instagram_url: 'https://www.instagram.com/megumi_cafe_vegan',
    genre: 'カフェ',
    area: '大阪市阿倍野区松崎町',
    prefecture: '大阪府',
    profile_text: '100%植物性の玄米と旬野菜ランチ＆ヴィーガンスイーツ。',
    features: ['大阪阿倍野・天王寺', '玄米菜食', '植物性100%', '手作りケーキ']
  },
  {
    id: 'vegan-cafe-46',
    name: 'Bio Terrace（名古屋栄）',
    instagram_id: '@bioterrace_nagoya',
    instagram_url: 'https://www.instagram.com/bioterrace_nagoya',
    genre: 'カフェ',
    area: '名古屋市中区栄',
    prefecture: '愛知県',
    profile_text: '名古屋屈指のヴィーガンカフェ。ロースイーツやハーブティー、スーパーフード。',
    features: ['名古屋栄中心地', 'ロースイーツ', 'スーパーフード', 'ヘルシービューティー']
  },
  {
    id: 'vegan-cafe-47',
    name: '穀菜カフェ ソラフネ（鎌倉大町）',
    instagram_id: '@sorafune_kamakura',
    instagram_url: 'https://www.instagram.com/sorafune_kamakura',
    genre: 'カフェ',
    area: '鎌倉市大町',
    prefecture: '神奈川県',
    profile_text: '築100年の古民家で楽しむマクロビオティック＆ヴィーガンスイーツ。',
    features: ['鎌倉古民家', 'マクロビオティック', '玄米スイーツ', '観光名所']
  },
  {
    id: 'vegan-cafe-48',
    name: '自然食＆ローフード LOHAS（札幌大通）',
    instagram_id: '@lohas_sapporo',
    instagram_url: 'https://www.instagram.com/lohas_sapporo',
    genre: 'カフェ',
    area: '札幌市中央区南2条',
    prefecture: '北海道',
    profile_text: '札幌の老舗ヴィーガン＆ローフードカフェ。酵素スイーツや豆乳デザート。',
    features: ['札幌大通公園近く', 'ローフード', '酵素スイーツ', '老舗自然食']
  },
  {
    id: 'vegan-cafe-49',
    name: 'Cafe178ミヤノサワ（札幌西区）',
    instagram_id: '@cafe178miyanosawa',
    instagram_url: 'https://www.instagram.com/cafe178miyanosawa',
    genre: 'カフェ',
    area: '札幌市西区宮の沢',
    prefecture: '北海道',
    profile_text: '自然栽培米と有機野菜のヴィーガンスイーツ隠れ家カフェ。',
    features: ['札幌宮の沢', '自然栽培', 'ヴィーガンスイーツ', '隠れ家カフェ']
  },
  {
    id: 'vegan-cafe-50',
    name: 'Big Apple（広島宮島口）',
    instagram_id: '@bigapple_miyajima',
    instagram_url: 'https://www.instagram.com/bigapple_miyajima',
    genre: 'カフェ',
    area: '廿日市市宮島口',
    prefecture: '広島県',
    profile_text: '世界遺産・宮島フェリー乗り場近くのヴィーガンカフェ＆ベイク。',
    features: ['広島宮島口', '世界遺産観光客', 'ヴィーガンベイク', '外国人人気']
  },
  {
    id: 'vegan-cafe-51',
    name: '暮らしの発酵DELI&CAFE（沖縄北中城村）',
    instagram_id: '@kurashinohakko_deli',
    instagram_url: 'https://www.instagram.com/kurashinohakko_deli',
    genre: 'カフェ',
    area: '中頭郡北中城村喜舎場',
    prefecture: '沖縄県',
    profile_text: 'EMウェルネス暮らしの発酵リゾート内のヴィーガンデリ＆カフェ。スイーツ充実。',
    features: ['沖縄ウェルネスホテル内', '発酵スイーツ', 'ヴィーガンデリ', 'オーガニック']
  },
  {
    id: 'vegan-cafe-52',
    name: 'カフェこくう（沖縄今帰仁村）',
    instagram_id: '@cafe_cokuu',
    instagram_url: 'https://www.instagram.com/cafe_cokuu',
    genre: 'カフェ',
    area: '国頭郡今帰仁村諸志',
    prefecture: '沖縄県',
    profile_text: 'やんばるの絶景と無農薬野菜のヴィーガンランチ＆デザートプレート。',
    features: ['沖縄今帰仁', 'やんばる絶景ビュー', '無農薬野菜スイーツ', '人気スポット']
  },
  {
    id: 'vegan-cafe-53',
    name: 'Cafe すみれ（沖縄石垣島）',
    instagram_id: '@cafe_sumire_ishigaki',
    instagram_url: 'https://www.instagram.com/cafe_sumire_ishigaki',
    genre: 'カフェ',
    area: '石垣市登野城',
    prefecture: '沖縄県',
    profile_text: '石垣島の自然素材を使った100%ヴィーガンカフェ。島フルーツのスイーツやアイス。',
    features: ['沖縄石垣島', '100%ヴィーガン', '島フルーツスイーツ', 'リゾート観光客']
  },
  {
    id: 'vegan-cafe-54',
    name: 'CAFE slow（東京国分寺）',
    instagram_id: '@cafeslow_tokyo',
    instagram_url: 'https://www.instagram.com/cafeslow_tokyo',
    genre: 'カフェ',
    area: '国分寺市東元町',
    prefecture: '東京都',
    profile_text: 'オーガニック＆スローフードの伝説的ヴィーガンカフェ。自然派アイスやスイーツ。',
    features: ['東京国分寺', 'スローフードの聖地', 'オーガニックスイーツ', '広いコミュニティ']
  },
  {
    id: 'vegan-cafe-55',
    name: '菓子工房 菓と果（福岡平尾）',
    instagram_id: '@kato_ka',
    instagram_url: 'https://www.instagram.com/kato_ka',
    genre: 'カフェ',
    area: '福岡市中央区平尾',
    prefecture: '福岡県',
    profile_text: '卵・乳製品・白砂糖不使用のプラントベース焼き菓子＆スイーツ専門店。',
    features: ['福岡平尾', '卵乳製品不使用', 'プラントベース焼菓子', '地元ファン多数']
  },
  // ============================================================
  // 🍛 カレー＆スパイス（25店舗）
  // ============================================================
  {
    id: 'vegan-curry-01',
    name: 'GARAM（ガラム）',
    instagram_id: '@garam_fukuoka',
    instagram_url: 'https://www.instagram.com/garam_fukuoka',
    genre: 'カレー',
    area: '福岡市高砂',
    prefecture: '福岡県',
    profile_text: '福岡スパイスカレーの超名店。鮮烈なスパイスの余韻を優しく包む豆乳アイスやチャイとのペアリングに最適。',
    features: ['福岡屈指の名店', 'スパイス極上', '食後アイス需要抜群']
  },
  {
    id: 'vegan-curry-02',
    name: 'クボカリー 大名店',
    instagram_id: '@kubo_curry',
    instagram_url: 'https://www.instagram.com/kubo_curry',
    genre: 'カレー',
    area: '福岡市大名',
    prefecture: '福岡県',
    profile_text: '福岡を代表するスパイスカリー店。スパイシーなカレーのあとの口直しスイーツへの関心が高い。',
    features: ['大名中心地', '福岡名物カレー', '口直しデザート◎']
  },
  {
    id: 'vegan-curry-03',
    name: 'アナンダカリー',
    instagram_id: '@anandacurry',
    instagram_url: 'https://www.instagram.com/anandacurry',
    genre: 'カレー',
    area: '福岡市',
    prefecture: '福岡県',
    profile_text: '完全植物性のヴィーガンスパイスカレー専門店。無農薬野菜とオーガニックスパイスで身体が喜ぶ一皿を提供。',
    features: ['完全植物性カレー', 'オーガニック', 'グルテンフリー']
  },
  {
    id: 'vegan-curry-04',
    name: 'negombo33',
    instagram_id: '@negombo33',
    instagram_url: 'https://www.instagram.com/negombo33',
    genre: 'カレー',
    area: '高円寺・埼玉所沢',
    prefecture: '東京都',
    profile_text: '全国屈指の人気スパイスカレー店。スパイスの余韻を楽しむ食後のアイスや珈琲とのペアリングを提案。',
    features: ['全国カレー百名店', '食後アイスペアリング', '高円寺']
  },
  {
    id: 'vegan-curry-05',
    name: 'BOTANI:CURRY（ボタニカリー）',
    instagram_id: '@botanicurry',
    instagram_url: 'https://www.instagram.com/botanicurry',
    genre: 'カレー',
    area: '大阪市本町',
    prefecture: '大阪府',
    profile_text: '大阪スパイスカレーブームの牽引店。ハーブとスパイスの爽快感あふれるカレー。辛味のあとの優しい口直しアイス需要大。',
    features: ['大阪スパイス頂点', 'ハーブ・スパイス爽快感', 'クールダウンアイス']
  },
  {
    id: 'vegan-curry-06',
    name: 'ハブモアカレー 表参道',
    instagram_id: '@have_more_curry',
    instagram_url: 'https://www.instagram.com/have_more_curry',
    genre: 'カレー',
    area: '港区南青山',
    prefecture: '東京都',
    profile_text: '表参道・南青山の旬野菜スパイスカレー店。契約農家の無農薬野菜を使用し、ベジタリアン・ヴィーガンに大人気。',
    features: ['表参道・青山', '旬の無農薬野菜', '野菜スパイスカレー']
  },
  {
    id: 'vegan-curry-07',
    name: 'もうやんカレー プラントベース',
    instagram_id: '@moyancurry',
    instagram_url: 'https://www.instagram.com/moyancurry',
    genre: 'カレー',
    area: '新宿・渋谷',
    prefecture: '東京都',
    profile_text: '香味野菜と漢方スパイスを2週間煮込んだ薬膳カレー。グルテンフリー＆完全植物性メニューを展開。',
    features: ['薬膳無水カレー', '大量野菜仕込み', 'グルテンフリー']
  },
  {
    id: 'vegan-curry-08',
    name: 'CURRY MASANITA',
    instagram_id: '@curry_masanita',
    instagram_url: 'https://www.instagram.com/curry_masanita',
    genre: 'カレー',
    area: '京都市',
    prefecture: '京都府',
    profile_text: '京都のスパイスカレー店。ヴィーガン対応プレートを展開し外国人観光客に好評。食後の冷たいスイーツ需要高。',
    features: ['京都スパイス', 'ヴィーガンプレート対応', 'デザートセット']
  },
  {
    id: 'vegan-curry-09',
    name: 'スパイスカレー ハルモニア',
    instagram_id: '@harmonia_curry',
    instagram_url: 'https://www.instagram.com/harmonia_curry',
    genre: 'カレー',
    area: '大阪市天満',
    prefecture: '大阪府',
    profile_text: '大阪天満の人気スパイスカレー店。素材の味を活かした創作カレーと食後のクールダウンデザートが人気。',
    features: ['大阪天満', '創作スパイス', 'クールダウン需要']
  },
  {
    id: 'vegan-curry-10',
    name: '咖喱屋 サーカス',
    instagram_id: '@circus_okinawa',
    instagram_url: 'https://www.instagram.com/circus_okinawa',
    genre: 'カレー',
    area: '那覇市',
    prefecture: '沖縄県',
    profile_text: '那覇の島野菜を使ったスパイスカレー店。完全植物性のヴィーガンカレーを提供し南国らしい食後スイーツが好評。',
    features: ['那覇市内', '島野菜ヴィーガン', '南国スイーツ好相性']
  },
  {
    id: 'vegan-curry-11',
    name: 'Dharmasagara 久留米（本格南インド料理）',
    instagram_id: '@dharmasagara_kurume',
    instagram_url: 'https://www.instagram.com/dharmasagara_kurume',
    genre: 'カレー',
    area: '久留米市日吉町',
    prefecture: '福岡県',
    profile_text: '東日本橋から久留米に移転した伝説の南インド料理。ベジタリアン・ヴィーガン完全対応。',
    features: ['久留米名店', '伝説の南インド料理', '完全ヴィーガン対応', '全国からファン殺到']
  },
  {
    id: 'vegan-curry-12',
    name: '菜食インドレストラン Shama（大阪四ツ橋）',
    instagram_id: '@shama_vegan',
    instagram_url: 'https://www.instagram.com/shama_vegan',
    genre: 'カレー',
    area: '大阪市西区北堀江',
    prefecture: '大阪府',
    profile_text: '全メニュー五葷抜き・ヴィーガン対応の本格菜食インド料理。ダールカレーやサモサ。',
    features: ['大阪四ツ橋', '五葷抜き対応', 'ヴィーガンインド料理', '本格スパイス']
  },
  {
    id: 'vegan-curry-13',
    name: '養生カレー（熊本市）',
    instagram_id: '@yojocurry',
    instagram_url: 'https://www.instagram.com/yojocurry',
    genre: 'カレー',
    area: '熊本市中央区新市街',
    prefecture: '熊本県',
    profile_text: '漢方生薬とスパイスを調合したヴィーガン対応カレープレート。健康志向客が殺到。',
    features: ['熊本市中心地', '漢方生薬スパイス', 'ヴィーガンプレート', '行列店']
  },
  {
    id: 'vegan-curry-14',
    name: 'CBD green（岡山市）',
    instagram_id: '@cbdgreen_okayama',
    instagram_url: 'https://www.instagram.com/cbdgreen_okayama',
    genre: 'カレー',
    area: '岡山市北区問屋町',
    prefecture: '岡山県',
    profile_text: '無農薬玄米のヴィーガンスパイスカレーやプラントベーススイーツ。',
    features: ['岡山市中心地', '無農薬玄米カレー', 'プラントベース', 'リラックスカフェ']
  },
  {
    id: 'vegan-curry-15',
    name: '酔彩（広島市中区）',
    instagram_id: '@suisai_spice',
    instagram_url: 'https://www.instagram.com/suisai_spice',
    genre: 'カレー',
    area: '広島市中区十日市町',
    prefecture: '広島県',
    profile_text: '地元有機野菜とオーガニックスパイスで作るヴィーガンカレー。',
    features: ['広島市中区', '有機野菜スパイスカレー', 'ヴィーガン対応', 'スパイスマニア支持']
  },
  {
    id: 'vegan-curry-16',
    name: 'Peace Cafe Tokyo（渋谷スクランブルスクエア）',
    instagram_id: '@peacecafetokyo',
    instagram_url: 'https://www.instagram.com/peacecafetokyo',
    genre: 'カレー',
    area: '渋谷区渋谷',
    prefecture: '東京都',
    profile_text: 'ハワイ発のヴィーガンカレー＆デリ専門店。ハワイアンヴィーガンカレーが看板。',
    features: ['渋谷スクランブルスクエア', 'ハワイ発有名店', 'ヴィーガンカレー', '女性客多数']
  },
  {
    id: 'vegan-curry-17',
    name: 'カリーライス専門店 エチオピア（神保町）',
    instagram_id: '@ethiopia_curry',
    instagram_url: 'https://www.instagram.com/ethiopia_curry',
    genre: 'カレー',
    area: '千代田区神田小川町',
    prefecture: '東京都',
    profile_text: 'カレーの聖地神保町の老舗。野菜カリーは植物性100%仕込みでベジタリアンに愛される。',
    features: ['神保町カレー聖地', '老舗名店', '野菜カリー植物性100%', 'スパイス濃厚']
  },
  {
    id: 'vegan-curry-18',
    name: 'ナタラジ 渋谷店（自然派インド料理）',
    instagram_id: '@nataraj_shibuya',
    instagram_url: 'https://www.instagram.com/nataraj_shibuya',
    genre: 'カレー',
    area: '渋谷区神南',
    prefecture: '東京都',
    profile_text: '自社農場直送の無農薬野菜と大豆ミートを使った日本初の自然派菜食インドカレー。',
    features: ['渋谷一等地', '日本初の菜食インド料理', '無農薬野菜', '大豆ミートカレー']
  },
  {
    id: 'vegan-curry-19',
    name: 'ナタラジ 銀座店',
    instagram_id: '@nataraj_ginza',
    instagram_url: 'https://www.instagram.com/nataraj_ginza',
    genre: 'カレー',
    area: '中央区銀座',
    prefecture: '東京都',
    profile_text: '銀座一等地の完全菜食インドレストラン。海外要人やヴィーガン旅行者に定番。',
    features: ['銀座一等地', '完全菜食レストラン', 'インバウンド定番', '上質空間']
  },
  {
    id: 'vegan-curry-20',
    name: 'ムルギー（渋谷円山町）',
    instagram_id: '@murugi_shibuya',
    instagram_url: 'https://www.instagram.com/murugi_shibuya',
    genre: 'カレー',
    area: '渋谷区道玄坂',
    prefecture: '東京都',
    profile_text: '昭和26年創業の伝説のカレー店。玉ねぎとスパイスの深いコク。',
    features: ['渋谷道玄坂', '昭和26年創業', '山型ライス', '歴史的名店']
  },
  {
    id: 'vegan-curry-21',
    name: 'カルダモン（大阪天六）',
    instagram_id: '@cardamom_tenroku',
    instagram_url: 'https://www.instagram.com/cardamom_tenroku',
    genre: 'カレー',
    area: '大阪市北区天神橋筋六丁目',
    prefecture: '大阪府',
    profile_text: 'スパイスマニア絶賛のベジタブルカレー。食後アイスとの相性抜群。',
    features: ['大阪天神橋筋六丁目', 'ベジタブルカレー', 'スパイス名店', 'デザート好相性']
  },
  {
    id: 'vegan-curry-22',
    name: 'スパイスチャンバー（京都四条烏丸）',
    instagram_id: '@spicechamber_kyoto',
    instagram_url: 'https://www.instagram.com/spicechamber_kyoto',
    genre: 'カレー',
    area: '京都市下京区室町通',
    prefecture: '京都府',
    profile_text: '京都のスパイスカレーの草分け。野菜と豆の濃厚スパイシーカレー。',
    features: ['京都四条烏丸', '京都スパイスカレー草分け', '濃厚スパイス', 'コアファン多数']
  },
  {
    id: 'vegan-curry-23',
    name: 'カリーシ（原宿・神宮前）',
    instagram_id: '@currysh_harajuku',
    instagram_url: 'https://www.instagram.com/currysh_harajuku',
    genre: 'カレー',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: '小麦粉・化学調味料不使用のヴィーガン対応スパイスカレー。',
    features: ['原宿神宮前', 'グルテンフリーカレー', '無化学調味料', '若者・クリエイター人気']
  },
  {
    id: 'vegan-curry-24',
    name: 'ポタジエ（沖縄那覇）',
    instagram_id: '@potager_okinawa',
    instagram_url: 'https://www.instagram.com/potager_okinawa',
    genre: 'カレー',
    area: '那覇市泊',
    prefecture: '沖縄県',
    profile_text: '沖縄島野菜とスパイスのヴィーガンカレー専門店。食後のさっぱりアイスが好相性。',
    features: ['沖縄那覇', '島野菜ヴィーガンカレー', '無添加', 'ヘルシーランチ']
  },
  {
    id: 'vegan-curry-25',
    name: 'カフェ ハルディ（長野軽井沢）',
    instagram_id: '@cafe_haldi_karuizawa',
    instagram_url: 'https://www.instagram.com/cafe_haldi_karuizawa',
    genre: 'カレー',
    area: '北佐久郡軽井沢町長倉',
    prefecture: '長野県',
    profile_text: '軽井沢の別荘族に愛されるヴィーガンフレンドリーなスパイスカレー＆ハーブティーカフェ。',
    features: ['軽井沢別荘地', 'スパイスカレー', 'ヴィーガン対応', '避暑地リゾート']
  },
  // ============================================================
  // 🍽️ レストラン＆ダイニング（30店舗）
  // ============================================================
  {
    id: 'vegan-restaurant-01',
    name: 'チャヤマクロビ ロイヤルパークホテル アイコニック汐留',
    instagram_id: '@chayamacrobi',
    instagram_url: 'https://www.instagram.com/chayamacrobi',
    genre: 'レストラン',
    area: '港区東新橋',
    prefecture: '東京都',
    profile_text: '汐留のラグジュアリーホテル内にあるマクロビオティックの名門。完全植物性のコース料理や極上スイーツ。',
    features: ['ホテル内名店', 'マクロビオティック', '汐留一等地', '植物性コース']
  },
  {
    id: 'vegan-restaurant-02',
    name: 'チャヤマクロビ ロイヤルパークホテル汐留',
    instagram_id: '@chayamacrobietics',
    instagram_url: 'https://www.instagram.com/chayamacrobietics',
    genre: 'レストラン',
    area: '港区東新橋',
    prefecture: '東京都',
    profile_text: '江戸時代から続く葉山の日影茶屋が手掛けるマクロビオティックレストラン。ホテル内の優雅な空間で植物性フルコース。',
    features: ['ホテル内優雅空間', 'マクロビオティック名門', 'コースデザート']
  },
  {
    id: 'vegan-restaurant-03',
    name: 'ブラウンライス（BROWN RICE 表参道）',
    instagram_id: '@brownrice_tokyo',
    instagram_url: 'https://www.instagram.com/brownrice_tokyo',
    genre: 'レストラン',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: 'ニールズヤードレメディーズが手掛ける和食ヴィーガンレストラン。玄米と無農薬野菜、伝統発酵調味料のコース。',
    features: ['表参道ニールズヤード', '玄米・伝統発酵', '洗練された和食']
  },
  {
    id: 'vegan-restaurant-04',
    name: '泉仙（いづせん 京都大徳寺）',
    instagram_id: '@izusen_kyoto',
    instagram_url: 'https://www.instagram.com/izusen_kyoto',
    genre: 'レストラン',
    area: '京都市北区紫野',
    prefecture: '京都府',
    profile_text: '京都大徳寺門前の伝統精進料理店。完全植物性の鉄鉢料理（てっぱちりょうり）を提供し世界中から予約多数。',
    features: ['伝統精進料理', '京都大徳寺門前', '鉄鉢料理']
  },
  {
    id: 'vegan-restaurant-05',
    name: '料理旅館 白梅（祇園）',
    instagram_id: '@shiraume_kyoto',
    instagram_url: 'https://www.instagram.com/shiraume_kyoto',
    genre: 'レストラン',
    area: '京都市祇園',
    prefecture: '京都府',
    profile_text: '京都祇園白川沿いの老舗料理旅館。海外からのヴィーガンゲスト向けに完全植物性の京懐石コースを提供。',
    features: ['祇園白川', 'ヴィーガン京懐石', '最高峰のおもてなし']
  },
  {
    id: 'vegan-restaurant-06',
    name: 'Green Earth（グリーンアース 大阪本町）',
    instagram_id: '@green_earth_osaka',
    instagram_url: 'https://www.instagram.com/green_earth_osaka',
    genre: 'レストラン',
    area: '大阪市中央区北久宝寺町',
    prefecture: '大阪府',
    profile_text: '1991年創業、大阪で最も歴史のあるヴィーガンレストラン。手作りの植物性洋食やデザートが欧米客に大評判。',
    features: ['1991年創業', '大阪老舗名店', '本町ビジネス街', '欧米客常連']
  },
  {
    id: 'vegan-restaurant-07',
    name: 'オーガニックレストラン びお亭',
    instagram_id: '@biotei_osaka',
    instagram_url: 'https://www.instagram.com/biotei_osaka',
    genre: 'レストラン',
    area: '大阪市中央区北浜',
    prefecture: '大阪府',
    profile_text: '大阪北浜の老舗オーガニックレストラン。無農薬野菜や玄米を使用した体にやさしいヴィーガン御膳。',
    features: ['大阪北浜', '老舗オーガニック', '玄米・無農薬']
  },
  {
    id: 'vegan-restaurant-08',
    name: '松竹園 Shouchikuen',
    instagram_id: '@shouchikuen',
    instagram_url: 'https://www.instagram.com/shouchikuen',
    genre: 'レストラン',
    area: '台東区浅草',
    prefecture: '東京都',
    profile_text: '浅草の完全ヴィーガン台湾素食・中華ダイニング。点心やコース料理、デザートを動物性一切不使用で提供。',
    features: ['浅草雷門近く', 'ヴィーガン中華・素食', '点心・デザート']
  },
  {
    id: 'vegan-restaurant-09',
    name: '自然食レストラン グレイス',
    instagram_id: '@grace_sapporo',
    instagram_url: 'https://www.instagram.com/grace_sapporo',
    genre: 'レストラン',
    area: '札幌市中央区',
    prefecture: '北海道',
    profile_text: '札幌の自然食・ヴィーガンレストラン。北海道の大自然で育まれた無農薬野菜を使用したフレンチ風ヴィーガン料理。',
    features: ['札幌自然食', '北海道有機野菜', 'フレンチ風ヴィーガン']
  },
  {
    id: 'vegan-restaurant-10',
    name: '喜楽楽（きらら）読谷村',
    instagram_id: '@kirara_okinawa',
    instagram_url: 'https://www.instagram.com/kirara_okinawa',
    genre: 'レストラン',
    area: '中頭郡読谷村',
    prefecture: '沖縄県',
    profile_text: '沖縄読谷村の薬膳＆マクロビオティック自然食レストラン。長寿の島沖縄の伝統ハーブと植物性料理。',
    features: ['沖縄伝統ハーブ', '薬膳マクロビ', '島野菜フル活用']
  },
  {
    id: 'vegan-restaurant-11',
    name: 'カジュアルレストラン Sui（福岡久山・Nayuta内）',
    instagram_id: '@sui_nayuta',
    instagram_url: 'https://www.instagram.com/sui_nayuta',
    genre: 'レストラン',
    area: '糟屋郡久山町久原',
    prefecture: '福岡県',
    profile_text: '地元の旬の自然栽培野菜を活かした100%ヴィーガンのイタリアンダイニング。',
    features: ['福岡久山Nayuta', '100%ヴィーガンイタリアン', '自然栽培野菜', '絶景ロケーション']
  },
  {
    id: 'vegan-restaurant-12',
    name: 'ヴィーガン居酒屋 真さか（京都烏丸）',
    instagram_id: '@masaka_vegan',
    instagram_url: 'https://www.instagram.com/masaka_vegan',
    genre: 'レストラン',
    area: '京都市中京区烏丸',
    prefecture: '京都府',
    profile_text: '京町家で大豆ミートのから揚げや餃子、ヴィーガン酒場メニューを展開。インバウンド殺到。',
    features: ['京都烏丸・京町家', 'ヴィーガン居酒屋', '大豆ミート唐揚げ', '外国人行列店']
  },
  {
    id: 'vegan-restaurant-13',
    name: 'Gira&L Vegan Restaurant（京都祇園四条）',
    instagram_id: '@gira_and_l_vegan',
    instagram_url: 'https://www.instagram.com/gira_and_l_vegan',
    genre: 'レストラン',
    area: '京都市東山区祇園町',
    prefecture: '京都府',
    profile_text: '祇園の町家で全国の有機野菜を使った上質ヴィーガンコース。',
    features: ['京都祇園一等地', '高級ヴィーガンコース', '京町家', '富裕層・海外旅行客']
  },
  {
    id: 'vegan-restaurant-14',
    name: 'リトルヘブン LITTLE-HEAVEN（京都太秦）',
    instagram_id: '@littleheaven_kyoto',
    instagram_url: 'https://www.instagram.com/littleheaven_kyoto',
    genre: 'レストラン',
    area: '京都市右京区太秦',
    prefecture: '京都府',
    profile_text: '植物性食材100%の京懐石・ヴィーガン創作コース（要予約）。',
    features: ['京都太秦', '100%植物性京懐石', '完全予約制', '極上の職人技']
  },
  {
    id: 'vegan-restaurant-15',
    name: 'Vege Kitchen KelaKela（大阪梅田）',
    instagram_id: '@kelakela_umeda',
    instagram_url: 'https://www.instagram.com/kelakela_umeda',
    genre: 'レストラン',
    area: '大阪市北区中崎西',
    prefecture: '大阪府',
    profile_text: '阪急梅田・中崎町の無添加オーガニックヴィーガンダイニング。',
    features: ['大阪梅田・中崎町', '無添加オーガニック', 'ヴィーガンプレート', '女子会人気']
  },
  {
    id: 'vegan-restaurant-16',
    name: 'Loving Hut（東京神田神保町）',
    instagram_id: '@lovinghut.jp',
    instagram_url: 'https://www.instagram.com/lovinghut.jp',
    genre: 'レストラン',
    area: '千代田区神田神保町',
    prefecture: '東京都',
    profile_text: '世界展開する100%ヴィーガンレストラン。点心やコース料理が充実。',
    features: ['神田神保町', '世界標準ヴィーガン', '菜食点心', '海外ビジター多数']
  },
  {
    id: 'vegan-restaurant-17',
    name: '2foods 渋谷ロフト店',
    instagram_id: '@2foods.jp',
    instagram_url: 'https://www.instagram.com/2foods.jp',
    genre: 'レストラン',
    area: '渋谷区宇田川町',
    prefecture: '東京都',
    profile_text: '「ヘルシージャンクフード」を掲げる最新プラントベースダイナー。',
    features: ['渋谷ロフト内', 'ヘルシージャンクフード', '話題のプラントベース', 'トレンド発信']
  },
  {
    id: 'vegan-restaurant-18',
    name: '2foods 銀座ロフト店',
    instagram_id: '@2foods_ginza',
    instagram_url: 'https://www.instagram.com/2foods_ginza',
    genre: 'レストラン',
    area: '中央区銀座',
    prefecture: '東京都',
    profile_text: '食事からデザートまで全て植物性の最新プラントベース旗艦店。',
    features: ['銀座ロフト内', 'プラントベース旗艦店', 'カフェ＆スイーツ', 'インバウンド多数']
  },
  {
    id: 'vegan-restaurant-19',
    name: '台湾素食 健福（東京六本木）',
    instagram_id: '@chienfu_vegan',
    instagram_url: 'https://www.instagram.com/chienfu_vegan',
    genre: 'レストラン',
    area: '港区六本木',
    prefecture: '東京都',
    profile_text: '台湾の伝統精進料理をベースにした本格ヴィーガン中華レストラン。',
    features: ['六本木', '本格台湾素食', 'ヴィーガン中華', '高級精進料理']
  },
  {
    id: 'vegan-restaurant-20',
    name: 'ピッツェリア・テアトリーノ（広島大崎上島）',
    instagram_id: '@teatrino_pizza',
    instagram_url: 'https://www.instagram.com/teatrino_pizza',
    genre: 'レストラン',
    area: '豊田郡大崎上島町',
    prefecture: '広島県',
    profile_text: '自家製ヴィーガンチーズと島野菜の薪窯ヴィーガンピッツァ。',
    features: ['広島瀬戸内離島', '薪窯ヴィーガンピッツァ', '自家製植物性チーズ', '島野菜']
  },
  {
    id: 'vegan-restaurant-21',
    name: '自然派食堂タマテバコ（那覇国際通り）',
    instagram_id: '@tamatebako_naha',
    instagram_url: 'https://www.instagram.com/tamatebako_naha',
    genre: 'レストラン',
    area: '那覇市松尾',
    prefecture: '沖縄県',
    profile_text: '沖縄県産無農薬野菜とプラントベース創作料理のベジ酒場。',
    features: ['那覇国際通り路地裏', '100%プラントベース酒場', '無農薬島野菜', '多国籍空間']
  },
  {
    id: 'vegan-restaurant-22',
    name: 'LaLaZorba（那覇市銘苅）',
    instagram_id: '@lalazorba',
    instagram_url: 'https://www.instagram.com/lalazorba',
    genre: 'レストラン',
    area: '那覇市銘苅',
    prefecture: '沖縄県',
    profile_text: '白砂糖・化学調味料一切不使用の本格ヴィーガンエスニックダイニング。',
    features: ['那覇新都心', '本格ヴィーガンエスニック', '白砂糖化学調味料不使用', '海外客絶賛']
  },
  {
    id: 'vegan-restaurant-23',
    name: 'ミチルキッチン（札幌大通）',
    instagram_id: '@michiru_kitchen',
    instagram_url: 'https://www.instagram.com/michiru_kitchen',
    genre: 'レストラン',
    area: '札幌市中央区南3条',
    prefecture: '北海道',
    profile_text: '北海道産野菜や豆を主役にした全品ヴィーガンの創作ビストロ。',
    features: ['札幌大通', '北海道産有機野菜', '全品ヴィーガンビストロ', 'ナチュラルワイン']
  },
  {
    id: 'vegan-restaurant-24',
    name: '万屋の勝手口（長崎市万屋町）',
    instagram_id: '@yorozuya_katsuteguchi',
    instagram_url: 'https://www.instagram.com/yorozuya_katsuteguchi',
    genre: 'レストラン',
    area: '長崎市万屋町',
    prefecture: '長崎県',
    profile_text: '長崎のオーガニック野菜と自然派調味料のヴィーガン創作料理。',
    features: ['長崎市中心地', 'オーガニック創作料理', 'ヴィーガンコース', 'こだわり調味料']
  },
  {
    id: 'vegan-restaurant-25',
    name: '茶房さくらさくら（熊本市水前寺）',
    instagram_id: '@sakurasakura_kumamoto',
    instagram_url: 'https://www.instagram.com/sakurasakura_kumamoto',
    genre: 'レストラン',
    area: '熊本市中央区水前寺公園',
    prefecture: '熊本県',
    profile_text: '熊本城近くの自家製無添加味噌と旬野菜の自然食レストラン。',
    features: ['熊本水前寺', '無添加自家製味噌', '自然食プレート', '健康志向']
  },
  {
    id: 'vegan-restaurant-26',
    name: '自然食 レストラン かなで（福岡早良区）',
    instagram_id: '@kanade_fukuoka',
    instagram_url: 'https://www.instagram.com/kanade_fukuoka',
    genre: 'レストラン',
    area: '福岡市早良区有田',
    prefecture: '福岡県',
    profile_text: '福岡の玄米菜食・オーガニック野菜とマクロビオティック。',
    features: ['福岡市早良区', '玄米菜食', 'マクロビオティック', '地元自然食名店']
  },
  {
    id: 'vegan-restaurant-27',
    name: '晴る家（鹿児島市城山町）',
    instagram_id: '@haruya_kagoshima',
    instagram_url: 'https://www.instagram.com/haruya_kagoshima',
    genre: 'レストラン',
    area: '鹿児島市城山町',
    prefecture: '鹿児島県',
    profile_text: '奄美の伝統食材と無農薬野菜のヴィーガン創作ダイニング。',
    features: ['鹿児島城山', '奄美オーガニック', 'ヴィーガン創作料理', '観光客に人気']
  },
  {
    id: 'vegan-restaurant-28',
    name: '鉢の木（鎌倉北鎌倉）',
    instagram_id: '@hachinoki_kamakura',
    instagram_url: 'https://www.instagram.com/hachinoki_kamakura',
    genre: 'レストラン',
    area: '鎌倉市山ノ内',
    prefecture: '神奈川県',
    profile_text: 'ミシュラン掲載の歴史ある鎌倉精進料理・ヴィーガン会席。',
    features: ['北鎌倉名所', 'ミシュラン掲載', '伝統精進料理', '完全植物性会席']
  },
  {
    id: 'vegan-restaurant-29',
    name: '自然食カフェ ル・コントワール（名古屋千種）',
    instagram_id: '@lecomptoir_nagoya',
    instagram_url: 'https://www.instagram.com/lecomptoir_nagoya',
    genre: 'レストラン',
    area: '名古屋市千種区今池',
    prefecture: '愛知県',
    profile_text: '愛知県産有機野菜を贅沢に使用したヴィーガンフレンチビストロ。',
    features: ['名古屋千種', 'ヴィーガンフレンチ', '愛知産有機野菜', '美食プラントベース']
  },
  {
    id: 'vegan-restaurant-30',
    name: 'Sajilo Cafe Forest（軽井沢）',
    instagram_id: '@sajilocafe',
    instagram_url: 'https://www.instagram.com/sajilocafe',
    genre: 'レストラン',
    area: '北佐久郡軽井沢町軽井沢',
    prefecture: '長野県',
    profile_text: '旧軽井沢の緑に囲まれたオーガニックスパイス＆ネパール料理レストラン。ヴィーガンコース対応。',
    features: ['旧軽井沢', '緑豊かな別荘地', 'オーガニックスパイス', 'ヴィーガン対応']
  },
  // ============================================================
  // 🏨 ホテル＆リゾート（15店舗）
  // ============================================================
  {
    id: 'vegan-hotel-01',
    name: 'Ace Hotel Kyoto（エースホテル京都）',
    instagram_id: '@acehotelkyoto',
    instagram_url: 'https://www.instagram.com/acehotelkyoto',
    genre: 'ホテル',
    area: '京都市烏丸御池',
    prefecture: '京都府',
    profile_text: 'アメリカ発の人気ライフスタイルホテル。海外宿泊客比率が非常に高く、ヴィーガン・グルテンフリーのデザート需要が常時発生。',
    features: ['世界的人気ホテル', 'インバウンド欧米客80%', 'ラウンジデザート需要◎']
  },
  {
    id: 'vegan-hotel-02',
    name: 'TRUNK(HOTEL) 東京・渋谷',
    instagram_id: '@trunkhotel',
    instagram_url: 'https://www.instagram.com/trunkhotel',
    genre: 'ホテル',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: 'ソーシャライジングをコンセプトにするブティックホテル。環境配慮・エシカルな食材や植物性デザートを積極導入。',
    features: ['渋谷ブティックホテル', 'サステナブル重視', 'エシカルスイーツ']
  },
  {
    id: 'vegan-hotel-03',
    name: 'sequence MIYASHITA PARK',
    instagram_id: '@sequence_miyashitapark',
    instagram_url: 'https://www.instagram.com/sequence_miyashitapark',
    genre: 'ホテル',
    area: '渋谷区神宮前',
    prefecture: '東京都',
    profile_text: '渋谷ミヤシタパーク直結の次世代ホテル。宿泊ラウンジやカフェにて、多様な食文化（ヴィーガン・アレルギー）に対応。',
    features: ['ミヤシタパーク直結', '次世代ライフスタイル', '多様性フード対応']
  },
  {
    id: 'vegan-hotel-04',
    name: 'ホテル ザ セレスティン東京芝',
    instagram_id: '@hotel_the_celestine_tokyo',
    instagram_url: 'https://www.instagram.com/hotel_the_celestine_tokyo',
    genre: 'ホテル',
    area: '港区芝',
    prefecture: '東京都',
    profile_text: '上質な空間と国内外ゲストのおもてなし。レストラン・バーでのアレルギー対応・ヴィーガンデザート提供に注力。',
    features: ['高級シティホテル', '国内外エグゼクティブ', 'バーラウンジ']
  },
  {
    id: 'vegan-hotel-05',
    name: 'K5（日本橋兜町）',
    instagram_id: '@hotel_k5',
    instagram_url: 'https://www.instagram.com/hotel_k5',
    genre: 'ホテル',
    area: '中央区日本橋兜町',
    prefecture: '東京都',
    profile_text: '兜町の大正建築をリノベした世界的ブティックホテル。感度の高い海外クリエイターが集い植物性メニューが人気。',
    features: ['リノベ建築美', '海外クリエイター集結', 'クラフト感重視']
  },
  {
    id: 'vegan-hotel-06',
    name: 'ハレクラニ沖縄',
    instagram_id: '@halekulani_okinawa',
    instagram_url: 'https://www.instagram.com/halekulani_okinawa',
    genre: 'ホテル',
    area: '国頭郡恩納村',
    prefecture: '沖縄県',
    profile_text: 'ハワイの名門ハレクラニの沖縄リゾート。各ダイニングでヴィーガン・プラントベースメニューをハイレベルで展開。',
    features: ['名門ラグジュアリー', '恩納村オーシャンフロント', '最高峰デザート需要']
  },
  {
    id: 'vegan-hotel-07',
    name: '星野リゾート 界 由布院',
    instagram_id: '@hoshinoresorts.kai',
    instagram_url: 'https://www.instagram.com/hoshinoresorts.kai',
    genre: 'ホテル',
    area: '由布市由布院',
    prefecture: '大分県',
    profile_text: '由布院の温泉旅館。自然派の食体験を重視し、アレルギー配慮や植物性デザートのニーズが高い。',
    features: ['星野リゾート温泉旅館', '自然派・エシカル', '富裕層・インバウンド']
  },
  {
    id: 'vegan-hotel-08',
    name: 'ザ・リッツ・カールトン京都',
    instagram_id: '@ritzcarltonkyoto',
    instagram_url: 'https://www.instagram.com/ritzcarltonkyoto',
    genre: 'ホテル',
    area: '京都市中京区鴨川',
    prefecture: '京都府',
    profile_text: '鴨川のほとりに佇む最高級ラグジュアリーホテル。海外富裕層のヴィーガン・アレルギーリクエストに常時対応。',
    features: ['最高級ラグジュアリー', '鴨川畔', '富裕層ヴィーガン常連']
  },
  {
    id: 'vegan-hotel-09',
    name: 'EMウェルネス 暮らしの発酵リゾート白浜（沖縄北中城村）',
    instagram_id: '@kurashinohakko_resort',
    instagram_url: 'https://www.instagram.com/kurashinohakko_resort',
    genre: 'ホテル',
    area: '中頭郡北中城村喜舎場',
    prefecture: '沖縄県',
    profile_text: '発酵食と無農薬野菜のヴィーガン朝食・ディナービュッフェ完備の先駆的ウェルネスホテル。',
    features: ['沖縄北中城', 'ウェルネスホテル', 'ヴィーガンビュッフェ', '発酵食・無農薬']
  },
  {
    id: 'vegan-hotel-10',
    name: 'TRUNK(HOTEL) YOYOGI PARK（東京代々木公園）',
    instagram_id: '@trunkhotel_yoyogipark',
    instagram_url: 'https://www.instagram.com/trunkhotel_yoyogipark',
    genre: 'ホテル',
    area: '渋谷区富ヶ谷',
    prefecture: '東京都',
    profile_text: '富裕層インバウンドが宿泊する代々木公園前のブティックホテル。プラントベースメニュー充実。',
    features: ['代々木公園前', 'ブティックホテル', '富裕層インバウンド', 'プラントベース充実']
  },
  {
    id: 'vegan-hotel-11',
    name: 'ハイアット セントリック 銀座 東京（NAMIKI667）',
    instagram_id: '@hyattcentricginza',
    instagram_url: 'https://www.instagram.com/hyattcentricginza',
    genre: 'ホテル',
    area: '中央区銀座',
    prefecture: '東京都',
    profile_text: '銀座並木通りのラグジュアリーホテル。季節のヴィーガンコースやデザートを常時展開。',
    features: ['銀座並木通り', 'ハイアットラグジュアリー', 'ヴィーガンコース', '洗練ダイニング']
  },
  {
    id: 'vegan-hotel-12',
    name: 'HOTEL THE MITSUI KYOTO（京都二条城前）',
    instagram_id: '@hotel_the_mitsui_kyoto',
    instagram_url: 'https://www.instagram.com/hotel_the_mitsui_kyoto',
    genre: 'ホテル',
    area: '京都市中京区二条油小路町',
    prefecture: '京都府',
    profile_text: '二条城に隣接する三井家ゆかりの最高峰ホテル。ヴィーガン特別懐石・デザート対応。',
    features: ['二条城隣接', '最高峰ラグジュアリー', 'ヴィーガン懐石対応', '庭園美']
  },
  {
    id: 'vegan-hotel-13',
    name: 'W 大阪（心斎橋）',
    instagram_id: '@wosakahotel',
    instagram_url: 'https://www.instagram.com/wosakahotel',
    genre: 'ホテル',
    area: '大阪市中央区南船場',
    prefecture: '大阪府',
    profile_text: 'マリオット系ラグジュアリーライフスタイルホテル。多国籍ゲストのヴィーガンリクエストに対応。',
    features: ['心斎橋一等地', 'Wホテル', 'ラグジュアリーライフスタイル', 'グローバル客対応']
  },
  {
    id: 'vegan-hotel-14',
    name: '京都ブライトンホテル（京都御所）',
    instagram_id: '@kyotobrightonhotel',
    instagram_url: 'https://www.instagram.com/kyotobrightonhotel',
    genre: 'ホテル',
    area: '京都市上京区新町通',
    prefecture: '京都府',
    profile_text: '京都御所西側の名門ホテル。精進・ヴィーガン京料理の評価が高い。',
    features: ['京都御所西', '名門ホテル', 'ヴィーガン京料理', '静謐な上質空間']
  },
  {
    id: 'vegan-hotel-15',
    name: 'ニセコノーザンリゾート・アンヌプリ',
    instagram_id: '@nisekonorthern',
    instagram_url: 'https://www.instagram.com/nisekonorthern',
    genre: 'ホテル',
    area: '虻田郡ニセコ町ニセコ',
    prefecture: '北海道',
    profile_text: '冬季欧米豪の富裕層スキー客が集う国際リゾート。ヴィーガンメニューを標準装備。',
    features: ['ニセコスキーリゾート', '欧米豪富裕層', 'インターナショナル対応', 'ヴィーガン標準装備']
  }
];

const KNOWN_OPTIONS = [
  'kitchen haco', '一粒庵', '新横浜ラーメン博物館',
  'Afuri', 'AFURI', '一風堂', 'IPPUDO',
  'ソラノイロ', 'SORANOIRO', '九州じゃんがら',
  '麺屋武蔵', '蒙古タンメン', '一蘭',
  'ハードロックカフェ', 'Hard Rock Cafe',
  'サラベス', 'bills', 'DEAN & DELUCA',
  'ロイヤルホスト', 'モスバーガー'
];

const KNOWN_PURE = [
  'soystories', 'ソイストーリーズ',
  'Ain Soph', 'AIN SOPH', 'アインソフ',
  'T\'s たんたん', 'T\'s レストラン', 'Ts たんたん',
  '2foods', 'トゥーフーズ',
  'Vegan Ramen UZU', 'Vegan Ramen YADOKARI',
  'BUGORO', '船出屋', 'まるたん',
  'wired bonbon', 'ブラウンライス', 'BROWN RICE',
  'Peace Cafe', 'ピースカフェ', 'TRUEBERRY', 'トゥルーベリー',
  'Loving Hut', 'ラビングハット', 'チャヤマクロビ', 'CHAYA',
  'ORGANIC TABLE BY LAPAZ', 'THE FARM CAFE', 'Mr.FARMER',
  'Alaska zwei', 'アラスカ ツヴァイ', 'Sonu Sonu', 'ソヌソヌ',
  'Guruatsu', 'グルアツ', 'PQ\'s', 'ピィキィズ',
  '菜食健美', '健福', '中里花苑', '忠庵',
  '大豆の夢', 'グレイスフルスイーツ', 'Hal Cafe 22',
  'Coco ChouChou', 'ココシュシュ', 'パプリカ食堂',
  '松竹圓', 'Shochiku-en', 'サイラム', 'SAIRAM',
  'Ballon', 'バロン', 'Great Lakes', 'グレイトレイクス',
  'Terra Burger', 'テラバーガー', 'Superiority Burger',
  '素食', '精進料理', '普茶料理'
];

export function classifyDietary(item: VeganRestaurantItem): '100%_vegan' | 'vegan_friendly' {
  const text = (item.name + ' ' + (item.profile_text || '') + ' ' + (item.features || []).join(' ')).toLowerCase();
  if (KNOWN_OPTIONS.some(k => item.name.toLowerCase().includes(k.toLowerCase()))) {
    return 'vegan_friendly';
  }
  if (KNOWN_PURE.some(k => item.name.toLowerCase().includes(k.toLowerCase()))) {
    return '100%_vegan';
  }
  if (
    item.features?.includes('ヴィーガンメニューあり') || 
    item.features?.includes('ヴィーガン対応') || 
    text.includes('ヴィーガンメニューあり') ||
    text.includes('ヴィーガン対応') ||
    text.includes('ヴィーガンプレートなど') ||
    text.includes('一部ヴィーガン') ||
    text.includes('オプション')
  ) {
    return 'vegan_friendly';
  }
  if (
    item.features?.includes('100%植物性') ||
    item.features?.includes('100%ヴィーガン') ||
    text.includes('完全ヴィーガン') ||
    text.includes('ヴィーガン専門') ||
    text.includes('プラントベース専門') ||
    text.includes('100% plant') ||
    text.includes('all vegan')
  ) {
    return '100%_vegan';
  }
  if (item.id.startsWith('vegan-vm-')) {
    return 'vegan_friendly';
  }
  return '100%_vegan';
}

/**
 * 営業用リード型（Lead）への変換ヘルパー
 */
export function getInitialVeganLeads(): Lead[] {
  const all: VeganRestaurantItem[] = [...VEGAN_RESTAURANTS_MASTER, ...VEGAN_RESTAURANTS_EXPANSION];
  return all.map((item, index) => {
    return {
      id: item.id,
      instagram_id: item.instagram_id,
      instagram_url: item.instagram_url,
      name: item.name,
      display_name: item.name,
      profile_text: `${item.area} ｜ ${item.profile_text}`,
      business_type: item.genre,
      genre: item.genre,
      area: item.area,
      prefecture: item.prefecture,
      features: item.features,
      dietary_type: classifyDietary(item),
      status: 'new',
      priority: 'high',
      tags: [item.prefecture, item.genre, ...item.features],
      notes: `${item.genre}（${item.area}）/ 特徴: ${item.features.join('・')}`,
      created_at: new Date(Date.now() - (all.length - index) * 3600000).toISOString(),
    };
  });
}
