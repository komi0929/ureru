import { redirect } from 'next/navigation';

// 営業モードは「営業ボード（/sales）」に統合しました
export default function LegacySalesPage() {
  redirect('/sales');
}
