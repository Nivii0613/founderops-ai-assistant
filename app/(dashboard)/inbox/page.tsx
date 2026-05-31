import { createClient } from '@/lib/supabase/server';
import { createInboxItemAction, analyzeInboxItemAction, updateInboxItemStatusAction } from '@/lib/actions/inbox';
import type { InboxItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Bot, Plus } from 'lucide-react';

const SOURCE_OPTIONS = ['email', 'founder_note', 'form_response', 'support', 'feedback', 'partnership'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-300',
  reviewed: 'bg-gray-500/20 text-gray-300',
  needs_reply: 'bg-yellow-500/20 text-yellow-300',
  converted: 'bg-green-500/20 text-green-300',
  archived: 'bg-red-500/20 text-red-300',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};
const CATEGORY_COLORS: Record<string, string> = {
  lead: 'bg-green-500/20 text-green-300',
  support: 'bg-orange-500/20 text-orange-300',
  product_feedback: 'bg-purple-500/20 text-purple-300',
  admin: 'bg-gray-500/20 text-gray-300',
  content: 'bg-blue-500/20 text-blue-300',
  personal: 'bg-pink-500/20 text-pink-300',
  other: 'bg-gray-500/20 text-gray-300',
};

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('inbox_items')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<InboxItem[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Inbox</h2>
          <p className="text-gray-400 mt-1">Capture and analyze inbound messages</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Plus size={16} /> Add New Item</h3>
        <form action={createInboxItemAction}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Source Type</label>
              <select name="source_type" required className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500">
                {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sender Email (optional)</label>
              <input name="sender_email" type="email" placeholder="sender@example.com" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sender Name (optional)</label>
              <input name="sender_name" placeholder="John Doe" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subject *</label>
              <input name="subject" required placeholder="Subject" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Message *</label>
            <textarea name="raw_text" required rows={4} placeholder="Paste the message here..." className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add to Inbox</button>
        </form>
      </div>

      <div className="space-y-3">
        {!items?.length && (
          <div className="text-center py-12 text-gray-500">No inbox items yet. Add your first message above.</div>
        )}
        {items?.map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status] ?? ''}`}>{item.status}</span>
                  {item.ai_category && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.ai_category] ?? ''}`}>{item.ai_category}</span>}
                  {item.ai_priority && <span className={`text-xs font-medium ${PRIORITY_COLORS[item.ai_priority] ?? ''}`}>{item.ai_priority} priority</span>}
                  <span className="text-xs text-gray-500">{item.source_type}</span>
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{item.subject}</h4>
                {item.sender_name && <p className="text-xs text-gray-400 mb-2">From: {item.sender_name} {item.sender_email ? `<${item.sender_email}>` : ''}</p>}
                <p className="text-gray-300 text-sm line-clamp-2">{item.raw_text}</p>
                {item.ai_summary && <p className="text-indigo-300 text-xs mt-2 italic">{item.ai_summary}</p>}
                {item.ai_suggested_action && <p className="text-yellow-300 text-xs mt-1">Action: {item.ai_suggested_action}</p>}
                <p className="text-gray-600 text-xs mt-2">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {!item.ai_category && (
                  <form action={analyzeInboxItemAction.bind(null, item.id)}>
                    <button type="submit" className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                      <Bot size={12} /> Analyze
                    </button>
                  </form>
                )}
                <form action={updateInboxItemStatusAction.bind(null, item.id, 'archived')}>
                  <button type="submit" className="text-gray-500 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors">Archive</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
