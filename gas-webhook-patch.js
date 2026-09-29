/**
 * ============================================================
 * SoyStories LP → CRM Webhook転送コード
 * ============================================================
 * 
 * 【使い方】
 * GASプロジェクト（https://script.google.com/u/0/home/projects/1g9g8cM66ynDHRi74YIRdqM3vQWPDa0hZnH90sBypRSmREwEiPEuTcnrw/edit）
 * の doPost(e) 関数内に、スプレッドシート記録処理の「後」に以下のコードを追記してください。
 * 
 * ★ 変更が必要な箇所:
 *   - CRM_WEBHOOK_URL: VercelデプロイURL に書き換え
 *   - CRM_WEBHOOK_SECRET: .env.local の WEBHOOK_SECRET_SOYSTORIES と同じ値
 * ============================================================
 */

// ---- ここから追記 ----

// CRM連携設定
var CRM_WEBHOOK_URL = 'https://soystories-crm.vercel.app/api/webhooks/soystories-lead'; // ← デプロイURLに書き換え
var CRM_WEBHOOK_SECRET = 'ss-webhook-2026-soystories-crm-secret';

/**
 * CRM Webhookにデータを転送する関数
 * @param {Object} data - LPからのフォームデータ
 */
function forwardToCRM(data) {
  try {
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-Webhook-Secret': CRM_WEBHOOK_SECRET
      },
      payload: JSON.stringify(data),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(CRM_WEBHOOK_URL, options);
    var responseCode = response.getResponseCode();
    var responseBody = response.getContentText();
    
    if (responseCode === 200) {
      Logger.log('✅ CRM連携成功: ' + responseBody);
    } else {
      Logger.log('⚠️ CRM連携エラー (HTTP ' + responseCode + '): ' + responseBody);
    }
  } catch (e) {
    // CRM連携が失敗しても、LP側の処理（スプレッドシート記録・メール通知）には影響しない
    Logger.log('❌ CRM連携例外: ' + e.message);
  }
}

// ---- ここまで追記 ----

/**
 * ============================================================
 * doPost(e) 関数内への追記箇所（既存コードの該当部分の後に1行追記）
 * ============================================================
 * 
 * 【既存の doPost(e) 内の最後のほう、スプレッドシート記録とメール送信の後に追記】
 * 
 * 例:
 * 
 *   function doPost(e) {
 *     var data = JSON.parse(e.postData.contents);
 *     
 *     // ... 既存のスプレッドシート記録処理 ...
 *     // ... 既存のメール通知処理 ...
 *     
 *     // ★ この1行を追記 ★
 *     forwardToCRM(data);
 *     
 *     return ContentService
 *       .createTextOutput(JSON.stringify({ status: 'success' }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * 
 * ============================================================
 */
