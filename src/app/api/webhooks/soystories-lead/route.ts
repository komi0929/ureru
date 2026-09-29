import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';

// Webhook用のSupabaseクライアント
// サービスロールキーが設定されている場合はRLSをバイパスし、
// 未設定の場合はanon keyで動作する（RLSポリシーの追加が必要）
function getWebhookSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // サービスロールキーがあればRLSバイパス、なければanon key
  return createClient(url, serviceRoleKey || anonKey, {
    auth: { persistSession: false },
  });
}

// ============================================================
// SoyStories LP → CRM Webhook受信エンドポイント
// POST /api/webhooks/soystories-lead
//
// LP (soystories.cafe) のサンプル申込・お問い合わせフォーム送信時に
// GAS経由でこのエンドポイントにJSONが転送される。
// ============================================================

// --- 型定義 ---

interface SamplePayload {
  formType: 'sample';
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  notes?: string;
  timestamp: string;
}

interface InquiryPayload {
  formType: 'inquiry';
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  message: string;
  timestamp: string;
}

type WebhookPayload = SamplePayload | InquiryPayload;

// --- バリデーション ---

function validatePayload(body: unknown): { valid: true; data: WebhookPayload } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'リクエストボディが空、またはJSON形式ではありません' };
  }

  const data = body as Record<string, unknown>;

  // 共通必須フィールド
  if (!data.formType || (data.formType !== 'sample' && data.formType !== 'inquiry')) {
    return { valid: false, error: 'formType は "sample" または "inquiry" である必要があります' };
  }
  if (!data.companyName || typeof data.companyName !== 'string') {
    return { valid: false, error: 'companyName（店舗名）は必須です' };
  }
  if (!data.contactName || typeof data.contactName !== 'string') {
    return { valid: false, error: 'contactName（担当者名）は必須です' };
  }
  if (!data.email || typeof data.email !== 'string') {
    return { valid: false, error: 'email（メールアドレス）は必須です' };
  }

  // サンプル申込の追加必須フィールド
  if (data.formType === 'sample') {
    if (!data.postalCode || typeof data.postalCode !== 'string') {
      return { valid: false, error: 'postalCode（郵便番号）はサンプル申込時に必須です' };
    }
    if (!data.address || typeof data.address !== 'string') {
      return { valid: false, error: 'address（住所）はサンプル申込時に必須です' };
    }
  }

  // お問い合わせの追加必須フィールド
  if (data.formType === 'inquiry') {
    if (!data.message || typeof data.message !== 'string') {
      return { valid: false, error: 'message（お問い合わせ内容）はお問い合わせ時に必須です' };
    }
  }

  return { valid: true, data: data as unknown as WebhookPayload };
}

// --- シークレット検証 ---

function verifySecret(request: NextRequest): boolean {
  const secret = process.env.WEBHOOK_SECRET_SOYSTORIES;
  // シークレット未設定の場合は開発環境とみなし通過
  if (!secret) {
    console.warn('[Webhook] WEBHOOK_SECRET_SOYSTORIES が未設定です。開発モードとして認証をスキップします。');
    return true;
  }
  const headerSecret = request.headers.get('X-Webhook-Secret') || request.headers.get('x-webhook-secret');
  return headerSecret === secret;
}

// --- 既存リード照合（メールアドレス or 店舗名で検索）---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findExistingLead(db: any, email: string, companyName: string): Promise<Record<string, any> | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    // metadata内のemailで検索（LP経由で過去に登録されたリード）
    const { data: byEmail } = await db
      .from('leads')
      .select('*')
      .contains('metadata', { email })
      .limit(1)
      .maybeSingle();

    if (byEmail) return byEmail;

    // display_name（店舗名）で前方一致検索
    const { data: byName } = await db
      .from('leads')
      .select('*')
      .ilike('display_name', `%${companyName}%`)
      .limit(1)
      .maybeSingle();

    if (byName) return byName;
  } catch (e) {
    console.warn('[Webhook] 既存リード照合エラー:', e);
  }

  return null;
}

// --- メインハンドラ ---

export async function POST(request: NextRequest) {
  // 1. シークレット検証
  if (!verifySecret(request)) {
    return NextResponse.json(
      { success: false, error: '認証エラー: 不正なWebhookシークレットです' },
      { status: 401 }
    );
  }

  // 2. ペイロードパース
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'JSONのパースに失敗しました' },
      { status: 400 }
    );
  }

  // 3. バリデーション
  const validation = validatePayload(body);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 }
    );
  }

  const payload = validation.data;
  const isSample = payload.formType === 'sample';
  const source = isSample ? 'lp_sample' : 'lp_inquiry';

  console.log(`[Webhook] ${isSample ? 'サンプル申込' : 'お問い合わせ'} 受信: ${payload.companyName} (${payload.email})`);

  // 4. Supabase が設定されている場合 → DB操作
  if (isSupabaseConfigured()) {
    const db = getWebhookSupabaseClient();
    try {
      // 4a. 既存リード照合
      const existingLead = await findExistingLead(db, payload.email, payload.companyName);

      let leadId: string;

      if (existingLead) {
        // 4b-1. 既存リードを更新
        leadId = existingLead.id;
        const currentMetadata = (existingLead.metadata || {}) as Record<string, unknown>;
        const updatedMetadata = {
          ...currentMetadata,
          email: payload.email,
          phone: payload.phone || currentMetadata.phone,
          contact_name: payload.contactName,
          source,
          last_lp_action: isSample ? 'sample_request' : 'inquiry',
          last_lp_action_at: payload.timestamp || new Date().toISOString(),
          ...(isSample && payload.formType === 'sample' ? {
            postal_code: (payload as SamplePayload).postalCode,
            address: (payload as SamplePayload).address,
          } : {}),
        };

        const updateData: Record<string, unknown> = {
          metadata: updatedMetadata,
          display_name: existingLead.display_name || payload.companyName,
          notes: buildUpdatedNotes(existingLead.notes, payload),
        };

        // サンプル申込の場合、ステータス更新を試みる
        // ただし、既に negotiating / contracted / won の場合は更新しない
        const skipStatusUpdate = ['negotiating', 'contracted', 'won', 'sample_sent'].includes(existingLead.status);

        // タグにLP流入元を追加
        const existingTags: string[] = existingLead.tags || [];
        const newTag = isSample ? 'LP_サンプル申込' : 'LP_問合せ';
        if (!existingTags.includes(newTag)) {
          updateData.tags = [...existingTags, newTag];
        }

        // まず sample_requested でステータス更新を試行
        if (isSample && !skipStatusUpdate) {
          updateData.status = 'sample_requested';
        }

        let { error: updateError } = await db
          .from('leads')
          .update(updateData)
          .eq('id', leadId);

        // sample_requested がDB ENUMに存在しない場合のフォールバック
        if (updateError && isSample && !skipStatusUpdate) {
          console.warn('[Webhook] sample_requested ステータスがDB ENUMにありません。new + タグで代替します。');
          updateData.status = 'new';
          const result = await db
            .from('leads')
            .update(updateData)
            .eq('id', leadId);
          updateError = result.error;
        }

        if (updateError) {
          console.error('[Webhook] リード更新エラー:', updateError);
          throw updateError;
        }

        console.log(`[Webhook] 既存リード更新: ${leadId} (${payload.companyName})`);
      } else {
        // 4b-2. 新規リード作成
        // instagram_id はLP経由のため、一意識別子として email ベースで生成
        const instagramId = `lp-${payload.email.replace(/[^a-zA-Z0-9]/g, '-')}`;

        const newLead: Record<string, unknown> = {
          instagram_id: instagramId,
          display_name: payload.companyName,
          status: isSample ? 'sample_requested' : 'new',
          business_type: 'カフェ',
          tags: isSample ? ['LP_サンプル申込'] : ['LP_問合せ'],
          notes: buildNewNotes(payload),
          metadata: {
            email: payload.email,
            phone: payload.phone || null,
            contact_name: payload.contactName,
            source,
            lp_registered_at: payload.timestamp || new Date().toISOString(),
            ...(isSample && payload.formType === 'sample' ? {
              postal_code: (payload as SamplePayload).postalCode,
              address: (payload as SamplePayload).address,
            } : {}),
            ...((!isSample && payload.formType === 'inquiry') ? {
              inquiry_message: (payload as InquiryPayload).message,
            } : {}),
          },
        };

        let { data: createdLead, error: createError } = await db
          .from('leads')
          .upsert([newLead], { onConflict: 'instagram_id' })
          .select()
          .single();

        // sample_requested がDB ENUMに存在しない場合のフォールバック
        if (createError && isSample) {
          console.warn('[Webhook] sample_requested ステータスがDB ENUMにありません。new + タグで代替します。');
          newLead.status = 'new';
          const result = await db
            .from('leads')
            .upsert([newLead], { onConflict: 'instagram_id' })
            .select()
            .single();
          createdLead = result.data;
          createError = result.error;
        }

        if (createError) {
          console.error('[Webhook] リード作成エラー:', createError);
          throw createError;
        }

        leadId = createdLead.id;
        console.log(`[Webhook] 新規リード作成: ${leadId} (${payload.companyName})`);
      }

      // 4c. サンプル申込の場合 → samples テーブルにレコード作成
      if (isSample && payload.formType === 'sample') {
        const samplePayload = payload as SamplePayload;
        const sampleRecord = {
          lead_id: leadId,
          status: 'requested',
          requested_at: samplePayload.timestamp || new Date().toISOString(),
          recipient_name: samplePayload.contactName,
          recipient_address: samplePayload.address,
          notes: samplePayload.notes || null,
          items: [], // おすすめ6種セットのため、具体的な商品IDは後から設定
        };

        const { error: sampleError } = await db
          .from('samples')
          .insert([sampleRecord]);

        if (sampleError) {
          console.error('[Webhook] サンプルレコード作成エラー:', sampleError);
          // サンプル作成失敗してもリード登録は成功しているので、警告に留める
        } else {
          console.log(`[Webhook] サンプルレコード作成完了 (lead: ${leadId})`);
        }
      }

      return NextResponse.json({
        success: true,
        message: isSample
          ? `サンプル申込を受付しました: ${payload.companyName}`
          : `お問い合わせを受付しました: ${payload.companyName}`,
        leadId,
        action: existingLead ? 'updated' : 'created',
      });

    } catch (error) {
      console.error('[Webhook] 処理エラー:', error);
      return NextResponse.json(
        { success: false, error: '内部処理エラーが発生しました' },
        { status: 500 }
      );
    }
  }

  // 5. Supabase 未設定（開発/モック環境）→ ログのみ出力して成功を返す
  console.log('[Webhook] [MOCK] Supabase未設定のためDB操作はスキップ。受信データ:', JSON.stringify(payload, null, 2));

  return NextResponse.json({
    success: true,
    message: `[開発モード] ${isSample ? 'サンプル申込' : 'お問い合わせ'}を受信しました: ${payload.companyName}`,
    action: 'mock',
    receivedData: payload,
  });
}

// --- ヘルパー関数 ---

/** 既存リードのnotesに追記 */
function buildUpdatedNotes(existingNotes: string | null, payload: WebhookPayload): string {
  const timestamp = new Date(payload.timestamp || Date.now()).toLocaleDateString('ja-JP');
  const isSample = payload.formType === 'sample';

  let newEntry = `\n--- LP ${isSample ? 'サンプル申込' : 'お問い合わせ'} (${timestamp}) ---`;
  newEntry += `\n担当: ${payload.contactName} / ${payload.email}`;

  if (isSample && payload.formType === 'sample') {
    const sp = payload as SamplePayload;
    newEntry += `\n送付先: 〒${sp.postalCode} ${sp.address}`;
    if (sp.notes) newEntry += `\n備考: ${sp.notes}`;
  } else if (payload.formType === 'inquiry') {
    newEntry += `\n内容: ${(payload as InquiryPayload).message}`;
  }

  return existingNotes ? `${existingNotes}\n${newEntry}` : newEntry;
}

/** 新規リードのnotes生成 */
function buildNewNotes(payload: WebhookPayload): string {
  const timestamp = new Date(payload.timestamp || Date.now()).toLocaleDateString('ja-JP');
  const isSample = payload.formType === 'sample';

  let notes = `LP経由 ${isSample ? 'サンプル申込' : 'お問い合わせ'} (${timestamp})`;
  notes += `\n担当: ${payload.contactName} / ${payload.email}`;
  if (payload.phone) notes += `\nTEL: ${payload.phone}`;

  if (isSample && payload.formType === 'sample') {
    const sp = payload as SamplePayload;
    notes += `\n送付先: 〒${sp.postalCode} ${sp.address}`;
    if (sp.notes) notes += `\n希望フレーバー/備考: ${sp.notes}`;
  } else if (payload.formType === 'inquiry') {
    notes += `\nお問い合わせ内容: ${(payload as InquiryPayload).message}`;
  }

  return notes;
}

// --- CORS対応（GASからの呼び出しで必要な場合） ---

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Secret',
    },
  });
}
