'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createLeadSchema } from '@/lib/validations';
import type { Lead } from '@/types';

export async function createLeadAction(input: {
  name: string;
  email?: string;
  source?: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed_won' | 'closed_lost';
  notes?: string;
  next_follow_up_at?: string;
  inbox_item_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
      source: parsed.data.source || null,
      notes: parsed.data.notes || null,
      next_follow_up_at: parsed.data.next_follow_up_at || null,
      inbox_item_id: parsed.data.inbox_item_id || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (input.inbox_item_id) {
    await supabase
      .from('inbox_items')
      .update({ status: 'converted' })
      .eq('id', input.inbox_item_id)
      .eq('user_id', user.id);
  }

  revalidatePath('/leads');
  revalidatePath('/dashboard');
  if (input.inbox_item_id) revalidatePath(`/inbox/${input.inbox_item_id}`);
  return { data };
}

export async function getLeadsAction(filters?: { limit?: number; needs_followup?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', data: null };

  let query = supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.needs_followup) {
    const today = new Date().toISOString().split('T')[0];
    query = query.lte('next_follow_up_at', today + 'T23:59:59Z').not('next_follow_up_at', 'is', null);
  }

  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) return { error: error.message, data: null };
  return { data: data as Lead[], error: null };
}
