'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createTaskSchema } from '@/lib/validations';
import type { Task, TaskStatus } from '@/types';

export async function createTaskAction(input: {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  inbox_item_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...parsed.data,
      due_date: parsed.data.due_date || null,
      inbox_item_id: parsed.data.inbox_item_id || null,
      user_id: user.id,
      status: 'open',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Mark source inbox item as converted
  if (input.inbox_item_id) {
    await supabase
      .from('inbox_items')
      .update({ status: 'converted' })
      .eq('id', input.inbox_item_id)
      .eq('user_id', user.id);
  }

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  if (input.inbox_item_id) revalidatePath(`/inbox/${input.inbox_item_id}`);
  return { data };
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { data };
}

export async function getTasksAction(filters?: { status?: TaskStatus; limit?: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', data: null };

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) return { error: error.message, data: null };
  return { data: data as Task[], error: null };
}
