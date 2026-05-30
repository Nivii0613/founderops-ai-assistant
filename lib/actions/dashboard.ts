'use server';

import { createClient } from '@/lib/supabase/server';
import type { DashboardSummary } from '@/types';

export async function getDashboardSummaryAction(): Promise<{ data: DashboardSummary | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Unauthorized' };

  const [inboxNew, inboxNeedsReply, inboxHighPriority, tasksOpen, leadsFollowup] = await Promise.all([
    supabase
      .from('inbox_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'new'),
    supabase
      .from('inbox_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'needs_reply'),
    supabase
      .from('inbox_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('priority', 'high')
      .not('status', 'in', '(archived,converted)'),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['open', 'in_progress']),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lte('next_follow_up_at', new Date().toISOString().split('T')[0] + 'T23:59:59Z')
      .not('next_follow_up_at', 'is', null),
  ]);

  return {
    data: {
      new_items: inboxNew.count ?? 0,
      needs_reply: inboxNeedsReply.count ?? 0,
      high_priority: inboxHighPriority.count ?? 0,
      open_tasks: tasksOpen.count ?? 0,
      leads_needing_followup: leadsFollowup.count ?? 0,
    },
    error: null,
  };
}
