import { NextRequest, NextResponse } from 'next/server';

// DM生成APIルート
// Google Gemini APIを使ってパーソナライズされたDM文面を生成する

interface GenerateDMRequest {
  profile_text: string;
  business_type: string;
  display_name: string;
  instagram_id: string;
  template_prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDMRequest = await request.json();
    const { profile_text, business_type, display_name, instagram_id, template_prompt } = body;

    // バリデーション
    if (!profile_text || !template_prompt) {
      return NextResponse.json(
        { error: 'profile_text と template_prompt は必須です' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // API キーがない場合はモックレスポンスを返す（開発用）
      const mockDM = generateMockDM(display_name, business_type, profile_text);
      return NextResponse.json({
        generated_text: mockDM,
        model: 'mock',
        tokens_used: 0,
      });
    }

    // テンプレートのプレースホルダーを実際の値で置換
    const filledPrompt = template_prompt
      .replace(/\{\{profile_text\}\}/g, profile_text)
      .replace(/\{\{business_type\}\}/g, business_type || '飲食店')
      .replace(/\{\{display_name\}\}/g, display_name || '')
      .replace(/\{\{instagram_id\}\}/g, instagram_id || '');

    // Google Gemini API呼び出し
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: filledPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: 'AI文面生成に失敗しました', details: errorText },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return NextResponse.json(
        { error: 'AIからの応答が空でした' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      generated_text: generatedText.trim(),
      model: 'gemini-2.0-flash',
      tokens_used: geminiData.usageMetadata?.totalTokenCount || 0,
    });
  } catch (error) {
    console.error('DM generation error:', error);
    return NextResponse.json(
      { error: 'DM生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 開発用モックDM生成
function generateMockDM(
  displayName: string,
  businessType: string,
  profileText: string
): string {
  const templates = [
    `こんにちは！${displayName || 'お店'}のInstagramを拝見して、${
      businessType || 'カフェ'
    }としてのこだわりに大変共感しました。

「${profileText?.substring(0, 30)}...」というコンセプト、素敵ですね✨

私たちSoyStoriesでは、100%プラントベース・完全グルテンフリーのアイスクリームを製造しています。豆乳ベースならではの濃厚でなめらかな味わいが特徴で、ヘルシー志向のお客様に大変ご好評いただいています。

もしよろしければ、無料サンプルをお送りしますので、ぜひ一度お試しいただけませんか？

詳しくはこちらをご覧ください👇
https://www.soystories.cafe/

お返事お待ちしております！🌿`,

    `突然のご連絡失礼いたします。${displayName || 'お店'}様の投稿を拝見し、とても惹かれてDMさせていただきました。

${
      businessType === 'レストラン'
        ? 'レストランのデザートメニューにぴったりな'
        : businessType === 'ベーカリー'
        ? 'パンと一緒にお楽しみいただける'
        : 'カフェメニューの差別化に最適な'
    }、プラントベースのアイスクリーム「SoyStories」をご紹介できればと思います。

✅ 100%ヴィーガン対応
✅ 完全グルテンフリー
✅ 6種類のフレーバー展開
✅ 低ロットから仕入れ可能

アレルギー対応メニューとして導入いただくことで、新しいお客様層の開拓にもつながります。

まずは無料サンプルからいかがでしょうか？
👉 https://www.soystories.cafe/

気になった点がございましたら、お気軽にご返信ください🌱`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
