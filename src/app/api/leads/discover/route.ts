import { NextRequest, NextResponse } from 'next/server';
import { findInstagramLeads } from '@/lib/instagram-finder';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      location = '全国', 
      keywords = ['ヴィーガン', 'ラーメン'], 
      limit = 15, 
      autoSave = true,
      category
    } = body;

    // 店舗Instagramアカウントを自動検索
    const discovered = await findInstagramLeads({
      location,
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      limit: Number(limit) || 15,
      category,
    });

    let savedCount = 0;

    // Supabaseが設定されていて autoSave が有効な場合、DBに保存
    if (autoSave && isSupabaseConfigured() && discovered.length > 0) {
      try {
        const rowsToInsert = discovered.map(lead => ({
          instagram_id: lead.instagram_id,
          instagram_url: lead.instagram_url,
          display_name: lead.display_name || lead.name,
          profile_text: lead.profile_text,
          business_type: lead.business_type || 'カフェ',
          status: 'new',
          tags: lead.tags || [location, '自動収集'],
        }));

        const { data, error } = await supabase
          .from('leads')
          .upsert(rowsToInsert, { onConflict: 'instagram_id', ignoreDuplicates: true })
          .select();

        if (!error && data) {
          savedCount = data.length;
        }
      } catch (dbError) {
        console.warn('Failed to auto-save discovered leads to Supabase:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      query: { location, keywords, limit, category },
      total_found: discovered.length,
      saved_to_db: savedCount,
      leads: discovered,
    });
  } catch (error: any) {
    console.error('Lead discovery API error:', error);
    return NextResponse.json(
      { error: '店舗アカウントの自動収集に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
