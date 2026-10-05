import { Lead } from '@/types';

export interface VeganRestaurantItem {
  id: string;
  name: string;
  instagram_id: string;
  instagram_url: string;
  genre: 'ラーメン' | 'バーガー' | 'カフェ' | 'カレー' | 'レストラン' | 'ホテル';
  area: string;
  prefecture: string;
  profile_text: string;
  features: string[];
}

export const VEGAN_RESTAURANTS_MASTER: VeganRestaurantItem[] = [
  // ============================================================
  // 🍜 ラーメン（41店舗）
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

  // ============================================================
  // 🍔 バーガー＆ダイナー（12店舗）
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

  // ============================================================
  // ☕ カフェ＆スイーツ（20店舗）
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

  // ============================================================
  // 🍛 カレー＆スパイス（10店舗）
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

  // ============================================================
  // 🍽️ レストラン＆ダイニング（10店舗）
  // ============================================================
  {
    id: 'vegan-rest-01',
    name: '菜道（SAIDO 自由が丘）',
    instagram_id: '@saido_tokyo',
    instagram_url: 'https://www.instagram.com/saido_tokyo',
    genre: 'レストラン',
    area: '目黒区自由が丘',
    prefecture: '東京都',
    profile_text: '世界一のヴィーガンレストランに輝いた和食ダイニング。精進の精神に基づき鰻重風やカツ丼風を完全植物性で再現。',
    features: ['世界一選出', 'ヴィーガン和食', '外国人富裕層御用達']
  },
  {
    id: 'vegan-rest-02',
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
    id: 'vegan-rest-03',
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
    id: 'vegan-rest-04',
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
    id: 'vegan-rest-05',
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
    id: 'vegan-rest-06',
    name: 'パプリカ食堂 Vegan 大阪本店',
    instagram_id: '@papurika_vegan',
    instagram_url: 'https://www.instagram.com/papurika_vegan',
    genre: 'レストラン',
    area: '大阪市西区新町',
    prefecture: '大阪府',
    profile_text: '「お肉・お魚・卵・乳製品・白砂糖・化学調味料を一切使いません」を掲げる大阪ヴィーガンのシンボルレストラン。',
    features: ['大阪ヴィーガン旗艦店', '無農薬野菜・無化調', 'スイーツ充実']
  },
  {
    id: 'vegan-rest-07',
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
    id: 'vegan-rest-08',
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
    id: 'vegan-rest-09',
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
    id: 'vegan-rest-10',
    name: '喜楽楽（きらら）読谷村',
    instagram_id: '@kirara_okinawa',
    instagram_url: 'https://www.instagram.com/kirara_okinawa',
    genre: 'レストラン',
    area: '中頭郡読谷村',
    prefecture: '沖縄県',
    profile_text: '沖縄読谷村の薬膳＆マクロビオティック自然食レストラン。長寿の島沖縄の伝統ハーブと植物性料理。',
    features: ['沖縄伝統ハーブ', '薬膳マクロビ', '島野菜フル活用']
  },

  // ============================================================
  // 🏨 ホテル＆ラウンジ（8店舗）
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
  }
];

/**
 * 営業用リード型（Lead）への変換ヘルパー
 */
export function getInitialVeganLeads(): Lead[] {
  return VEGAN_RESTAURANTS_MASTER.map((item, index) => {
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
      status: 'new',
      priority: 'high',
      tags: [item.prefecture, item.genre, ...item.features],
      notes: `${item.genre}（${item.area}）/ 特徴: ${item.features.join('・')}`,
      created_at: new Date(Date.now() - (VEGAN_RESTAURANTS_MASTER.length - index) * 3600000).toISOString(),
    };
  });
}
