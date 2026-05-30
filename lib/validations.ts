import { z } from 'zod';

export const createInboxItemSchema = z.object({
  source_type: z.enum(['email', 'founder_note', 'form_response', 'support', 'feedback', 'partnership']),
  sender_name: z.string().max(200).optional(),
  sender_email: z.string().email().optional().or(z.literal('')),
  subject: z.string().min(1, 'Subject is required').max(500),
  raw_text: z.string().min(10, 'Message must be at least 10 characters').max(10000),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
  inbox_item_id: z.string().uuid().optional(),
});

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(300),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().max(200).optional(),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost']),
  notes: z.string().max(2000).optional(),
  next_follow_up_at: z.string().optional(),
  inbox_item_id: z.string().uuid().optional(),
});

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  body: z.string().min(1, 'Body is required').max(10000),
  tags: z.array(z.string()).optional(),
  inbox_item_id: z.string().uuid().optional(),
});

export const aiAnalysisResultSchema = z.object({
  category: z.enum(['lead', 'support', 'product_feedback', 'admin', 'content', 'personal', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  summary: z.string().min(1).max(500),
  suggested_action: z.string().min(1).max(1000),
  draft_reply: z.string().max(2000),
});
