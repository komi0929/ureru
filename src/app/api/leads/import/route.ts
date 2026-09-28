import { NextRequest, NextResponse } from 'next/server';

// CSVインポートAPIルート
// Apify等でスクレイピングしたターゲットリストを取り込む

interface CSVRow {
  instagram_id: string;
  instagram_url?: string;
  name?: string;
  display_name?: string;
  profile_text?: string;
  business_type?: string;
  followers_count?: string;
  following_count?: string;
  website_url?: string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim().replace(/^"|"$/g, '') || '';
    });

    // instagram_id は必須
    if (!row.instagram_id && !row.username && !row.instagram_username) continue;

    rows.push({
      instagram_id: row.instagram_id || row.username || row.instagram_username || '',
      instagram_url: row.instagram_url || row.url || row.profile_url || '',
      name: row.name || row.display_name || row.full_name || '',
      profile_text: row.profile_text || row.bio || row.biography || '',
      business_type: row.business_type || row.category || row.business_category || '',
      followers_count: row.followers_count || row.followers || '',
      following_count: row.following_count || row.following || '',
      website_url: row.website_url || row.website || row.external_url || '',
    });
  }

  return rows;
}

// CSVの1行をパース（クォーテーション対応）
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'CSVファイルが必要です' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSVからデータを読み取れませんでした。ヘッダー行を確認してください。' },
        { status: 400 }
      );
    }

    // TODO: Supabase連携時に実際のDB挿入に置き換え
    // const { data, error } = await supabase.from('leads').insert(
    //   rows.map(row => ({
    //     instagram_id: row.instagram_id,
    //     instagram_url: row.instagram_url || `https://instagram.com/${row.instagram_id.replace('@', '')}`,
    //     display_name: row.name,
    //     profile_text: row.profile_text,
    //     business_type: row.business_type,
    //     follower_count: row.followers_count ? parseInt(row.followers_count) : null,
    //     status: 'new',
    //   }))
    // );

    return NextResponse.json({
      success: true,
      imported_count: rows.length,
      preview: rows.slice(0, 5), // 最初の5行をプレビュー
      columns: Object.keys(rows[0] || {}),
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'CSVインポート中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
