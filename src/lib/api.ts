import { SupabaseClient } from '@supabase/supabase-js'
import { 
  Lead, 
  LeadStatus,
  DmTemplate, 
  DmMessage, 
  Sample, 
  SampleStatus,
  Order, 
  OrderStatus,
  FunnelData,
  TemplatePerformanceData,
  MonthlyCostRevenueData,
  PacingStats
} from '@/types'
import {
  mockLeads,
  mockDmTemplates,
  mockDmMessages,
  mockSamples,
  mockOrders,
  mockFunnelData,
  mockTemplatePerformance,
  mockMonthlyCostRevenue,
  mockPacingStats
} from '@/lib/mock-data'

export const USE_MOCK = true;

// ============================================================
// Leads
// ============================================================

export async function getLeads(
  supabase: SupabaseClient, 
  filters?: { status?: LeadStatus; business_type?: string; search?: string }
): Promise<Lead[]> {
  if (USE_MOCK) {
    let leads = [...mockLeads];
    if (filters?.status) {
      leads = leads.filter(l => l.status === filters.status);
    }
    if (filters?.business_type) {
      leads = leads.filter(l => l.business_type === filters.business_type);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      leads = leads.filter(l => 
        (l.name && l.name.toLowerCase().includes(search)) ||
        (l.instagram_id && l.instagram_id.toLowerCase().includes(search))
      );
    }
    return leads;
  }

  let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.business_type) {
    query = query.eq('business_type', filters.business_type);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,instagram_id.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Lead[];
}

export async function getLeadById(supabase: SupabaseClient, id: string): Promise<Lead | null> {
  if (USE_MOCK) {
    return mockLeads.find(l => l.id === id) || null;
  }

  const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as Lead;
}

export async function createLead(supabase: SupabaseClient, data: Partial<Lead>): Promise<Lead> {
  if (USE_MOCK) {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      instagram_id: data.instagram_id || '',
      name: data.name || null,
      profile_text: data.profile_text || null,
      business_type: data.business_type || null,
      status: data.status || 'new',
      created_at: new Date().toISOString(),
      notes: data.notes || null,
      ...data
    };
    mockLeads.unshift(newLead);
    return newLead;
  }

  const { data: created, error } = await supabase.from('leads').insert(data).select().single();
  if (error) throw error;
  return created as Lead;
}

export async function updateLead(supabase: SupabaseClient, id: string, data: Partial<Lead>): Promise<Lead> {
  if (USE_MOCK) {
    const idx = mockLeads.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Lead not found');
    mockLeads[idx] = { ...mockLeads[idx], ...data, updated_at: new Date().toISOString() };
    return mockLeads[idx];
  }

  const { data: updated, error } = await supabase
    .from('leads')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as Lead;
}

export async function updateLeadStatus(supabase: SupabaseClient, id: string, status: LeadStatus): Promise<Lead> {
  return updateLead(supabase, id, { status });
}

export async function bulkUpdateLeadStatus(supabase: SupabaseClient, ids: string[], status: LeadStatus): Promise<void> {
  if (USE_MOCK) {
    ids.forEach(id => {
      const idx = mockLeads.findIndex(l => l.id === id);
      if (idx !== -1) {
        mockLeads[idx].status = status;
        mockLeads[idx].updated_at = new Date().toISOString();
      }
    });
    return;
  }

  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids);
  
  if (error) throw error;
}

export async function deleteLead(supabase: SupabaseClient, id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = mockLeads.findIndex(l => l.id === id);
    if (idx !== -1) mockLeads.splice(idx, 1);
    return;
  }

  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

export async function importLeadsFromCSV(supabase: SupabaseClient, leads: Partial<Lead>[]): Promise<Lead[]> {
  if (USE_MOCK) {
    const newLeads = leads.map(data => ({
      id: `lead-csv-${Date.now()}-${Math.random()}`,
      instagram_id: data.instagram_id || '',
      name: data.name || null,
      profile_text: data.profile_text || null,
      business_type: data.business_type || null,
      status: data.status || 'new',
      created_at: new Date().toISOString(),
      notes: data.notes || null,
      ...data
    } as Lead));
    mockLeads.push(...newLeads);
    return newLeads;
  }

  const { data, error } = await supabase.from('leads').insert(leads).select();
  if (error) throw error;
  return data as Lead[];
}

// ============================================================
// DM Templates
// ============================================================

export async function getDmTemplates(supabase: SupabaseClient): Promise<DmTemplate[]> {
  if (USE_MOCK) return mockDmTemplates;

  const { data, error } = await supabase.from('dm_templates').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as DmTemplate[];
}

export async function createDmTemplate(supabase: SupabaseClient, data: Partial<DmTemplate>): Promise<DmTemplate> {
  if (USE_MOCK) {
    const newTemplate: DmTemplate = {
      id: `tmpl-${Date.now()}`,
      name: data.name || 'New Template',
      created_at: new Date().toISOString(),
      ...data
    };
    mockDmTemplates.push(newTemplate);
    return newTemplate;
  }

  const { data: created, error } = await supabase.from('dm_templates').insert(data).select().single();
  if (error) throw error;
  return created as DmTemplate;
}

export async function updateDmTemplate(supabase: SupabaseClient, id: string, data: Partial<DmTemplate>): Promise<DmTemplate> {
  if (USE_MOCK) {
    const idx = mockDmTemplates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Template not found');
    mockDmTemplates[idx] = { ...mockDmTemplates[idx], ...data, updated_at: new Date().toISOString() };
    return mockDmTemplates[idx];
  }

  const { data: updated, error } = await supabase
    .from('dm_templates')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as DmTemplate;
}

export async function toggleDmTemplateActive(supabase: SupabaseClient, id: string, is_active: boolean): Promise<DmTemplate> {
  return updateDmTemplate(supabase, id, { is_active });
}

// ============================================================
// DM Messages
// ============================================================

export async function getDmMessagesByLead(supabase: SupabaseClient, leadId: string): Promise<DmMessage[]> {
  if (USE_MOCK) {
    return mockDmMessages.filter(m => m.lead_id === leadId);
  }

  const { data, error } = await supabase.from('dm_messages').select('*, template:dm_templates(*)').eq('lead_id', leadId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as DmMessage[];
}

export async function createDmMessage(supabase: SupabaseClient, data: Partial<DmMessage>): Promise<DmMessage> {
  if (USE_MOCK) {
    const newMsg: DmMessage = {
      id: `msg-${Date.now()}`,
      lead_id: data.lead_id!,
      template_id: data.template_id || null,
      status: data.status || 'generated',
      sent_at: null,
      created_at: new Date().toISOString(),
      ...data
    };
    mockDmMessages.push(newMsg);
    return newMsg;
  }

  const { data: created, error } = await supabase.from('dm_messages').insert(data).select().single();
  if (error) throw error;
  return created as DmMessage;
}

export async function updateDmMessageStatus(supabase: SupabaseClient, id: string, data: Partial<DmMessage>): Promise<DmMessage> {
  if (USE_MOCK) {
    const idx = mockDmMessages.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Message not found');
    mockDmMessages[idx] = { ...mockDmMessages[idx], ...data };
    return mockDmMessages[idx];
  }

  const { data: updated, error } = await supabase
    .from('dm_messages')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as DmMessage;
}

export async function markDmMessageCopied(supabase: SupabaseClient, id: string): Promise<DmMessage> {
  return updateDmMessageStatus(supabase, id, { 
    status: 'copied', 
    copied_at: new Date().toISOString() 
  });
}

export async function markDmMessageSent(supabase: SupabaseClient, id: string): Promise<DmMessage> {
  return updateDmMessageStatus(supabase, id, { 
    status: 'sent', 
    sent_at: new Date().toISOString() 
  });
}

export async function markDmMessageReplied(supabase: SupabaseClient, id: string): Promise<DmMessage> {
  return updateDmMessageStatus(supabase, id, { 
    status: 'replied', 
    replied_at: new Date().toISOString() 
  });
}

// ============================================================
// Samples
// ============================================================

export async function getSamples(supabase: SupabaseClient): Promise<Sample[]> {
  if (USE_MOCK) return mockSamples;

  const { data, error } = await supabase.from('samples').select('*, lead:leads(*)').order('requested_at', { ascending: false });
  if (error) throw error;
  return data as Sample[];
}

export async function getSamplesByStatus(supabase: SupabaseClient, status: SampleStatus): Promise<Sample[]> {
  if (USE_MOCK) return mockSamples.filter(s => s.status === status);

  const { data, error } = await supabase.from('samples').select('*, lead:leads(*)').eq('status', status).order('requested_at', { ascending: false });
  if (error) throw error;
  return data as Sample[];
}

export async function createSample(supabase: SupabaseClient, data: Partial<Sample>): Promise<Sample> {
  if (USE_MOCK) {
    const newSample: Sample = {
      id: `sample-${Date.now()}`,
      lead_id: data.lead_id!,
      status: data.status || 'requested',
      items: data.items || [],
      tracking_number: data.tracking_number || null,
      requested_at: new Date().toISOString(),
      ...data
    };
    mockSamples.push(newSample);
    return newSample;
  }

  const { data: created, error } = await supabase.from('samples').insert(data).select().single();
  if (error) throw error;
  return created as Sample;
}

export async function updateSampleStatus(
  supabase: SupabaseClient, 
  id: string, 
  status: SampleStatus, 
  extraData?: Partial<Sample>
): Promise<Sample> {
  const updateData: Partial<Sample> = { status, updated_at: new Date().toISOString(), ...extraData };
  
  if (status === 'packing' && !updateData.packed_at) updateData.packed_at = new Date().toISOString();
  if (status === 'shipped' && !updateData.shipped_at) updateData.shipped_at = new Date().toISOString();
  if (status === 'delivered' && !updateData.delivered_at) updateData.delivered_at = new Date().toISOString();
  if (status === 'feedback' && !updateData.feedback_at) updateData.feedback_at = new Date().toISOString();

  if (USE_MOCK) {
    const idx = mockSamples.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Sample not found');
    mockSamples[idx] = { ...mockSamples[idx], ...updateData };
    return mockSamples[idx];
  }

  const { data: updated, error } = await supabase
    .from('samples')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as Sample;
}

// ============================================================
// Orders
// ============================================================

export async function getOrders(supabase: SupabaseClient, customerId?: string): Promise<Order[]> {
  if (USE_MOCK) {
    let orders = [...mockOrders];
    if (customerId) {
      orders = orders.filter(o => o.customer_id === customerId);
    }
    return orders;
  }

  let query = supabase.from('orders').select('*, customer:customers(*)').order('created_at', { ascending: false });
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Order[];
}

export async function createOrder(supabase: SupabaseClient, data: Partial<Order>): Promise<Order> {
  if (USE_MOCK) {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      status: data.status || 'pending',
      total_amount: data.total_amount || 0,
      items: data.items || [],
      created_at: new Date().toISOString(),
      ...data
    };
    mockOrders.push(newOrder);
    return newOrder;
  }

  const { data: created, error } = await supabase.from('orders').insert(data).select().single();
  if (error) throw error;
  return created as Order;
}

export async function updateOrderStatus(supabase: SupabaseClient, id: string, status: OrderStatus): Promise<Order> {
  const updateData: Partial<Order> = { status, updated_at: new Date().toISOString() };
  if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();
  if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
  if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

  if (USE_MOCK) {
    const idx = mockOrders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    mockOrders[idx] = { ...mockOrders[idx], ...updateData };
    return mockOrders[idx];
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as Order;
}

// ============================================================
// Analytics
// ============================================================

export async function getFunnelStats(supabase: SupabaseClient): Promise<FunnelData> {
  if (USE_MOCK) return mockFunnelData;

  // In a real app, this would likely be an RPC call or complex query
  // For now, we fallback to mock data structure or basic query
  const { count: total_scraped } = await supabase.from('leads').select('*', { count: 'exact', head: true });
  const { count: dm_sent } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'dm_sent');
  const { count: replied } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'replied');
  const { count: sample_requested } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'sample_requested');
  const { count: won } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'won');

  return {
    total_scraped: total_scraped || 0,
    dm_sent: dm_sent || 0,
    replied: replied || 0,
    sample_requested: sample_requested || 0,
    won: won || 0,
  };
}

export async function getTemplatePerformance(supabase: SupabaseClient): Promise<TemplatePerformanceData[]> {
  if (USE_MOCK) return mockTemplatePerformance;

  const { data, error } = await supabase.from('dm_templates').select('id, name, appeal_type, sent_count, reply_count');
  if (error) throw error;
  return (data as any[]).map(t => ({
    template_id: t.id,
    template_name: t.name,
    appeal_type: t.appeal_type,
    sent_count: t.sent_count || 0,
    reply_count: t.reply_count || 0,
    reply_rate: t.sent_count ? ((t.reply_count || 0) / t.sent_count) * 100 : 0
  }));
}

export async function getMonthlyCostRevenue(supabase: SupabaseClient): Promise<MonthlyCostRevenueData[]> {
  if (USE_MOCK) return mockMonthlyCostRevenue;

  // Fallback to mock data if RPC is not available
  return mockMonthlyCostRevenue;
}

export async function getDmPacingStats(supabase: SupabaseClient): Promise<PacingStats> {
  if (USE_MOCK) return mockPacingStats;

  return mockPacingStats;
}
