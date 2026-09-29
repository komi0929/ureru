import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Lead, Sample } from '@/types';
import { mockLeads, mockSamples } from '@/lib/mock-data';

// Keep in-memory mock states for fallback during development
let fallbackLeads: Lead[] = [...mockLeads];
let fallbackSamples: Sample[] = [...mockSamples];

// --------------
// Leads CRUD
// --------------
export async function getLeads(filters?: {
  status?: string;
  business_type?: string;
  search?: string;
  priority?: string; // 'hot' | 'high' | 'medium' | 'low'
}): Promise<Lead[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('leads').select('*');
      
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.business_type) query = query.eq('business_type', filters.business_type);
      if (filters?.priority) query = query.eq('priority', filters.priority);
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,instagram_id.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (!error && data) return data as Lead[];
      console.warn('Supabase getLeads error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase getLeads exception, falling back to mock:', e);
    }
  }

  // Fallback to mock data
  let result = [...fallbackLeads];
  if (filters) {
    if (filters.status) result = result.filter(l => l.status === filters.status);
    if (filters.business_type) result = result.filter(l => l.business_type === filters.business_type);
    if (filters.priority) result = result.filter(l => l.priority === filters.priority);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l => (l.name || '').toLowerCase().includes(q) || l.instagram_id.toLowerCase().includes(q));
    }
  }
  return result;
}

export async function createLead(lead: Partial<Lead>): Promise<Lead> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('leads').insert([lead]).select().single();
      if (!error && data) return data as Lead;
      console.warn('Supabase createLead error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase createLead exception, falling back to mock:', e);
    }
  }

  // Fallback to mock data
  const newLead = { ...lead, id: `lead-${Date.now()}`, created_at: new Date().toISOString() } as Lead;
  fallbackLeads = [newLead, ...fallbackLeads];
  return newLead;
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('leads').update({ status }).eq('id', id);
      if (!error) return;
      console.warn('Supabase updateLeadStatus error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase updateLeadStatus exception, falling back to mock:', e);
    }
  }

  // Fallback to mock data
  fallbackLeads = fallbackLeads.map(l => l.id === id ? { ...l, status: status as any } : l);
}

export async function importLeads(leads: Partial<Lead>[]): Promise<{ imported: number; duplicates: number }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('leads').upsert(leads, { onConflict: 'instagram_id', ignoreDuplicates: true }).select();
      if (!error) {
        const imported = data?.length || 0;
        return { imported, duplicates: leads.length - imported };
      }
      console.warn('Supabase importLeads error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase importLeads exception, falling back to mock:', e);
    }
  }

  // Fallback to mock data
  let imported = 0;
  let duplicates = 0;
  for (const lead of leads) {
    const exists = fallbackLeads.some(l => l.instagram_id === lead.instagram_id);
    if (exists) {
      duplicates++;
    } else {
      fallbackLeads.unshift({ ...lead, id: `lead-${Date.now()}-${Math.random()}`, created_at: new Date().toISOString() } as Lead);
      imported++;
    }
  }
  return { imported, duplicates };
}

export async function updateLeadNotes(id: string, notes: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('leads').update({ notes }).eq('id', id);
      if (!error) return;
      console.warn('Supabase updateLeadNotes error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase updateLeadNotes exception, falling back to mock:', e);
    }
  }

  // Fallback to mock data
  fallbackLeads = fallbackLeads.map(l => l.id === id ? { ...l, notes } : l);
}

// --------------
// DM Pacing
// --------------
export async function logDmSend(leadId: string, templateId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('dm_messages').insert([{
        lead_id: leadId,
        template_id: templateId,
        status: 'sent',
        sent_at: new Date().toISOString()
      }]);
      if (!error) return;
      console.warn('Supabase logDmSend error:', error);
    } catch (e) {
      console.warn('Supabase logDmSend exception:', e);
    }
  }
  // Mock fallback does nothing for now
}

export async function getPacingStats(): Promise<{ sent_last_hour: number; sent_last_24h: number; max_per_hour: number; max_per_24h: number; status: string }> {
  const max_per_hour = 10;
  const max_per_24h = 40;
  
  if (isSupabaseConfigured()) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const [hourRes, dayRes] = await Promise.all([
        supabase.from('dm_messages').select('*', { count: 'exact', head: true }).gte('sent_at', oneHourAgo),
        supabase.from('dm_messages').select('*', { count: 'exact', head: true }).gte('sent_at', oneDayAgo)
      ]);
      
      if (!hourRes.error && !dayRes.error) {
        const sent_last_hour = hourRes.count || 0;
        const sent_last_24h = dayRes.count || 0;
        let status = 'safe';
        
        if (sent_last_hour >= max_per_hour || sent_last_24h >= max_per_24h) status = 'critical';
        else if (sent_last_hour >= max_per_hour * 0.8 || sent_last_24h >= max_per_24h * 0.8) status = 'warning';
        
        return { sent_last_hour, sent_last_24h, max_per_hour, max_per_24h, status };
      }
      console.warn('Supabase getPacingStats error, falling back to mock:', hourRes.error || dayRes.error);
    } catch (e) {
      console.warn('Supabase getPacingStats exception, falling back to mock:', e);
    }
  }
  
  // Fallback to mock data
  return { sent_last_hour: 2, sent_last_24h: 15, max_per_hour, max_per_24h, status: 'safe' };
}

// --------------
// Samples
// --------------
export async function getSamples(): Promise<Sample[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('samples').select('*, leads(*)').order('requested_at', { ascending: false });
      if (!error && data) return data as any as Sample[];
      console.warn('Supabase getSamples error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase getSamples exception, falling back to mock:', e);
    }
  }
  return [...fallbackSamples];
}

export async function createSample(data: { lead_id: string; products: string[]; notes?: string }): Promise<Sample> {
  if (isSupabaseConfigured()) {
    try {
      const sample = {
        lead_id: data.lead_id,
        status: 'requested',
        requested_at: new Date().toISOString(),
        items: data.products.map(p => ({ product_id: p, quantity: 1 })),
        feedback_notes: data.notes
      };
      const { data: resData, error } = await supabase.from('samples').insert([sample]).select().single();
      if (!error && resData) return resData as Sample;
      console.warn('Supabase createSample error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase createSample exception, falling back to mock:', e);
    }
  }

  // Fallback to mock data
  const newSample = {
    id: `samp-${Date.now()}`,
    lead_id: data.lead_id,
    requested_at: new Date().toISOString(),
    status: 'requested',
    items: data.products.map(p => ({ product_id: p, quantity: 1 })),
    shipping_address: '',
    tracking_number: null,
    feedback_score: null,
    feedback_notes: data.notes || null,
  } as Sample;
  fallbackSamples = [newSample, ...fallbackSamples];
  return newSample;
}

export async function updateSampleStatus(id: string, status: string, trackingNumber?: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const updateData: any = { status };
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
      
      const { error } = await supabase.from('samples').update(updateData).eq('id', id);
      if (!error) return;
      console.warn('Supabase updateSampleStatus error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase updateSampleStatus exception, falling back to mock:', e);
    }
  }

  // Fallback to mock data
  fallbackSamples = fallbackSamples.map(s => {
    if (s.id === id) {
      return { ...s, status, tracking_number: trackingNumber !== undefined ? trackingNumber : s.tracking_number } as Sample;
    }
    return s;
  });
}

// --------------
// Analytics
// --------------
export async function getFunnelStats(): Promise<{ stage: string; count: number }[]> {
  if (isSupabaseConfigured()) {
    try {
      const statuses = ['new', 'contacted', 'replied', 'sample_requested', 'negotiating', 'won', 'lost'];
      const stats = await Promise.all(statuses.map(async (status) => {
        const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', status);
        return { stage: status, count: count || 0 };
      }));
      return stats;
    } catch (e) {
      console.warn('Supabase getFunnelStats exception, falling back to mock:', e);
    }
  }

  // Fallback derived from fallbackLeads
  const stats: Record<string, number> = {
    new: 0, contacted: 0, replied: 0, sample_requested: 0, negotiating: 0, won: 0, lost: 0
  };
  fallbackLeads.forEach(l => {
    if (stats[l.status] !== undefined) {
      stats[l.status]++;
    } else {
      stats[l.status] = 1;
    }
  });
  
  // Ensure the required stages are present
  const defaultStages = ['new', 'contacted', 'replied', 'sample_requested', 'negotiating', 'won', 'lost'];
  return defaultStages.map(stage => ({
    stage,
    count: stats[stage] || 0
  }));
}

// --------------
// LP連携ヘルパー（SoyStories LP Webhook用）
// --------------

/** LP経由のリードをメールアドレスで検索 */
export async function findLeadByEmail(email: string): Promise<Lead | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .contains('metadata', { email })
        .limit(1)
        .maybeSingle();

      if (!error && data) return data as Lead;
    } catch (e) {
      console.warn('findLeadByEmail exception:', e);
    }
  }

  // フォールバック: mock leads の metadata.email で検索
  const found = fallbackLeads.find(l => {
    const meta = l.metadata as Record<string, unknown> | undefined;
    return meta?.email === email;
  });
  return found || null;
}

/** LP経由でリードを新規作成 */
export async function createLeadFromLP(data: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  source: 'lp_sample' | 'lp_inquiry';
  postalCode?: string;
  address?: string;
  notes?: string;
}): Promise<Lead> {
  const instagramId = `lp-${data.email.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const isSample = data.source === 'lp_sample';

  const lead: Partial<Lead> = {
    instagram_id: instagramId,
    display_name: data.companyName,
    name: data.companyName,
    status: isSample ? 'sample_requested' : 'new',
    business_type: 'カフェ',
    tags: isSample ? ['LP_サンプル申込'] : ['LP_問合せ'],
    notes: data.notes || null,
    metadata: {
      email: data.email,
      phone: data.phone || null,
      contact_name: data.contactName,
      source: data.source,
      postal_code: data.postalCode || null,
      address: data.address || null,
    },
  };

  return createLead(lead);
}

/** LP経由サンプル申込からサンプルレコードを作成 */
export async function createSampleFromLP(data: {
  leadId: string;
  contactName: string;
  address: string;
  notes?: string;
}): Promise<Sample> {
  if (isSupabaseConfigured()) {
    try {
      const sample = {
        lead_id: data.leadId,
        status: 'requested',
        requested_at: new Date().toISOString(),
        recipient_name: data.contactName,
        recipient_address: data.address,
        notes: data.notes || null,
        items: [],
      };
      const { data: resData, error } = await supabase.from('samples').insert([sample]).select().single();
      if (!error && resData) return resData as Sample;
      console.warn('Supabase createSampleFromLP error, falling back to mock:', error);
    } catch (e) {
      console.warn('Supabase createSampleFromLP exception, falling back to mock:', e);
    }
  }

  // フォールバック
  const newSample = {
    id: `samp-lp-${Date.now()}`,
    lead_id: data.leadId,
    requested_at: new Date().toISOString(),
    status: 'requested',
    items: [],
    recipient_name: data.contactName,
    recipient_address: data.address,
    tracking_number: null,
    feedback_score: null,
    feedback_notes: data.notes || null,
  } as Sample;
  fallbackSamples = [newSample, ...fallbackSamples];
  return newSample;
}
