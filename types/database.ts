export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SourceType =
  | 'email'
  | 'founder_note'
  | 'form_response'
  | 'support'
  | 'feedback'
  | 'partnership';

export type Category =
  | 'lead'
  | 'support'
  | 'product_feedback'
  | 'admin'
  | 'content'
  | 'personal'
  | 'other';

export type Priority = 'low' | 'medium' | 'high';

export type InboxStatus =
  | 'new'
  | 'reviewed'
  | 'needs_reply'
  | 'converted'
  | 'archived';

export type TaskStatus = 'open' | 'in_progress' | 'done';

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'closed_won'
  | 'closed_lost';

export type AiRunStatus = 'pending' | 'success' | 'error';

export interface InboxItem {
  id: string;
  user_id: string;
  source_type: SourceType;
  sender_name: string | null;
  sender_email: string | null;
  subject: string;
  raw_text: string;
  category: Category | null;
  priority: Priority | null;
  summary: string | null;
  suggested_action: string | null;
  draft_reply: string | null;
  status: InboxStatus;
  ai_processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  inbox_item_id: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  inbox_item_id: string | null;
  name: string;
  email: string | null;
  source: string | null;
  stage: LeadStage;
  notes: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  inbox_item_id: string | null;
  title: string;
  body: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface AiRun {
  id: string;
  user_id: string;
  inbox_item_id: string;
  model: string;
  prompt_version: string;
  status: AiRunStatus;
  raw_output: Json | null;
  error_message: string | null;
  created_at: string;
}

export interface DashboardSummary {
  new_items: number;
  needs_reply: number;
  high_priority: number;
  open_tasks: number;
  leads_needing_followup: number;
}
