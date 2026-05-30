'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createNoteSchema } from '@/lib/validations';
import type { Note } from '@/types';

export async function createNoteAction(input: {
  title: string;
  body: string;
  tags?: string[];
  inbox_item_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      ...parsed.data,
      tags: parsed.data.tags ?? null,
      inbox_item_id: parsed.data.inbox_item_id || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/notes');
  revalidatePath('/dashboard');
  if (input.inbox_item_id) revalidatePath(`/inbox/${input.inbox_item_id}`);
  return { data };
}

export async function getNotesAction(filters?: { limit?: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', data: null };

  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) return { error: error.message, data: null };
  return { data: data as Note[], error: null };
}
