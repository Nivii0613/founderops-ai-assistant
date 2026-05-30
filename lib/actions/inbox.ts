'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createInboxItemSchema } from '@/lib/validations';
import { analyzeInboxItem } from '@/lib/ai/analyze';
import type { InboxItem, InboxStatus } from '@/types';

export async function createInboxItemAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const raw = {
    source_type: formData.get('source_type'),
    sender_name: formData.get('sender_name') || undefined,
    sender_email: formData.get('sender_email') || undefined,
    subject: formData.get('subject'),
    raw_text: formData.get('raw_text'),
  };

  const parsed = createInboxItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('inbox_items')
    .insert({
      ...parsed.data,
      sender_email: parsed.data.sender_email || null,
      sender_name: parsed.data.sender_name || null,
      user_id: user.id,
      status: 'new',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/inbox');
  revalidatePath('/dashboard');
  return { data };
}

export async function analyzeInboxItemAction(itemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: item, error: fetchErr } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !item) return { error: 'Item not found' };

  // Create pending AI run record
  const { data: aiRun } = await supabase
    .from('ai_runs')
    .insert({
      user_id: user.id,
      inbox_item_id: itemId,
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      prompt_version: 'v1',
      status: 'pending',
    })
    .select()
    .single();

  const result = await analyzeInboxItem(item.raw_text, item.subject, item.source_type);

  if ('error' in result) {
    if (aiRun) {
      await supabase
        .from('ai_runs')
        .update({ status: 'error', error_message: result.error })
        .eq('id', aiRun.id);
    }
    return { error: result.error };
  }

  // Update the inbox item with AI results
  const { data: updated, error: updateErr } = await supabase
    .from('inbox_items')
    .update({
      category: result.category,
      priority: result.priority,
      summary: result.summary,
      suggested_action: result.suggested_action,
      draft_reply: result.draft_reply,
      ai_processed_at: new Date().toISOString(),
      status: 'reviewed',
    })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (updateErr) return { error: updateErr.message };

  // Update AI run to success
  if (aiRun) {
    await supabase
      .from('ai_runs')
      .update({ status: 'success', raw_output: result as unknown as Record<string, unknown> })
      .eq('id', aiRun.id);
  }

  revalidatePath(`/inbox/${itemId}`);
  revalidatePath('/inbox');
  revalidatePath('/dashboard');
  return { data: updated };
}

export async function updateInboxItemStatusAction(itemId: string, status: InboxStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('inbox_items')
    .update({ status })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/inbox/${itemId}`);
  revalidatePath('/inbox');
  revalidatePath('/dashboard');
  return { data };
}

export async function updateDraftReplyAction(itemId: string, draft_reply: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('inbox_items')
    .update({ draft_reply })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/inbox/${itemId}`);
  return { data };
}

export async function getInboxItemsAction(filters?: {
  status?: InboxStatus;
  limit?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', data: null };

  let query = supabase
    .from('inbox_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) return { error: error.message, data: null };
  return { data: data as InboxItem[], error: null };
}
