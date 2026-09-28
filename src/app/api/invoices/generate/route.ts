import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { 
      order_number = `INV-${Date.now()}`, 
      customer_name = 'お客様',
      company_name = '株式会社サンプル',
      items = [], 
      issue_date = new Date().toISOString()
    } = data;

    // Format dates
    const dateObj = new Date(issue_date);
    const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1); // 10% tax
    const total = subtotal + tax;

    // Currency formatter
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
    };

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">${item.name || '商品'} ${item.flavor ? `(${item.flavor})` : ''}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>請求書 - ${order_number}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 60px; }
          .title { font-size: 28px; font-weight: bold; letter-spacing: 2px; border-bottom: 2px solid #4ade80; padding-bottom: 10px; margin-bottom: 20px; }
          .company-info { text-align: right; font-size: 14px; }
          .company-name { font-weight: bold; font-size: 18px; margin-bottom: 5px; color: #166534; }
          .customer-info { margin-bottom: 40px; font-size: 16px; }
          .customer-name { font-size: 20px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; display: inline-block; min-width: 200px; margin-bottom: 10px; }
          .invoice-meta { display: flex; justify-content: flex-end; margin-bottom: 30px; font-size: 14px; }
          .meta-table { border-collapse: collapse; }
          .meta-table td { padding: 4px 12px; }
          .meta-label { background-color: #f3f4f6; font-weight: bold; border: 1px solid #d1d5db; }
          .meta-value { border: 1px solid #d1d5db; }
          .total-box { display: flex; justify-content: center; margin-bottom: 40px; }
          .total-amount-container { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px 40px; text-align: center; }
          .total-label { font-size: 16px; color: #166534; margin-bottom: 5px; }
          .total-value { font-size: 32px; font-weight: bold; color: #15803d; }
          table.items { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 14px; }
          table.items th { background-color: #f3f4f6; padding: 12px 8px; text-align: left; border-bottom: 2px solid #d1d5db; color: #4b5563; }
          table.items th.center { text-align: center; }
          table.items th.right { text-align: right; }
          .summary-container { display: flex; justify-content: flex-end; }
          table.summary { width: 300px; border-collapse: collapse; font-size: 14px; }
          table.summary td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
          table.summary td.label { font-weight: bold; }
          table.summary td.value { text-align: right; }
          table.summary tr.total td { font-weight: bold; font-size: 16px; border-bottom: 2px solid #333; }
          .footer { margin-top: 60px; font-size: 13px; color: #6b7280; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .bank-info { background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 30px; font-size: 14px; border: 1px solid #e5e7eb; }
          .bank-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="title">請求書</div>
            </div>
            <div class="company-info">
              <div class="company-name">SoyStories</div>
              <div>〒100-0000<br>東京都千代田区1-1-1<br>ソイビルディング 5F</div>
              <div>Email: billing@soystories.com</div>
              <div>適格請求書発行事業者登録番号: T1234567890123</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between;">
            <div class="customer-info">
              <div class="customer-name">\${company_name}</div><br>
              \${customer_name} 様
              <p style="margin-top: 20px;">下記の通りご請求申し上げます。</p>
            </div>
            
            <div class="invoice-meta">
              <table class="meta-table">
                <tr>
                  <td class="meta-label">請求日</td>
                  <td class="meta-value">\${formattedDate}</td>
                </tr>
                <tr>
                  <td class="meta-label">請求番号</td>
                  <td class="meta-value">\${order_number}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="total-box">
            <div class="total-amount-container">
              <div class="total-label">ご請求金額 (税込)</div>
              <div class="total-value">\${formatCurrency(total)}</div>
            </div>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>品目・内容</th>
                <th class="center" style="width: 80px;">数量</th>
                <th class="right" style="width: 120px;">単価</th>
                <th class="right" style="width: 120px;">金額</th>
              </tr>
            </thead>
            <tbody>
              \${itemsHtml}
            </tbody>
          </table>

          <div class="summary-container">
            <table class="summary">
              <tr>
                <td class="label">小計</td>
                <td class="value">\${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td class="label">消費税 (10%)</td>
                <td class="value">\${formatCurrency(tax)}</td>
              </tr>
              <tr class="total">
                <td class="label">合計</td>
                <td class="value">\${formatCurrency(total)}</td>
              </tr>
            </table>
          </div>

          <div class="bank-info">
            <div class="bank-title">お振込先</div>
            <div>
              ソイ銀行 (0000) 大豆支店 (111)<br>
              普通 1234567<br>
              カ）ソイストーリーズ<br>
              <br>
              <small>※ 誠に恐れ入りますが、振込手数料は貴社にてご負担賜りますようお願い申し上げます。<br>
              ※ お支払期限: 発行日の翌月末日</small>
            </div>
          </div>

          <div class="footer">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </div>
        </div>
      </body>
      </html>
    `;

    return NextResponse.json({
      html,
      invoice_number: order_number,
      status: 'success'
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
