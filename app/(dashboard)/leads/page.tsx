import { createClient } from '@/lib/supabase/server';
import { createLeadAction, updateLeadStageAction } from '@/lib/actions/leads';
import type { Lead } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'];
const STAGE_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-300',
  contacted: 'bg-purple-500/20 text-purple-300',
  qualified: 'bg-yellow-500/20 text-yellow-300',
  proposal: 'bg-orange-500/20 text-orange-300',
  closed_won: 'bg-green-500/20 text-green-300',
  closed_lost: 'bg-red-500/20 text-red-300',
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Lead[]>();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Leads</h2>
        <p className="text-gray-400 mt-1">Track your potential customers</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Plus size={16} /> Add Lead</h3>
        <form action={createLeadAction}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name *</label>
              <input name="name" required placeholder="Jane Smith" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input name="email" type="email" placeholder="jane@company.com" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Source</label>
              <input name="source" placeholder="Twitter, referral, cold outreach..." className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stage</label>
              <select name="stage" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500">
                {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea name="notes" rows={2} placeholder="Context about this lead..." className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Lead</button>
        </form>
      </div>

      <div className="space-y-3">
        {!leads?.length && (
          <div className="text-center py-12 text-gray-500">No leads yet. Add your first one above.</div>
        )}
        {leads?.map((lead) => (
          <div key={lead.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[lead.stage] ?? ''}`}>{lead.stage.replace('_', ' ')}</span>
                  {lead.source && <span className="text-xs text-gray-500">{lead.source}</span>}
                </div>
                <h4 className="text-white font-semibold">{lead.name}</h4>
                {lead.email && <p className="text-gray-400 text-sm">{lead.email}</p>}
                {lead.notes && <p className="text-gray-400 text-sm mt-2">{lead.notes}</p>}
                <p className="text-gray-600 text-xs mt-2">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
              </div>
              <div>
                <form action={updateLeadStageAction.bind(null, lead.id)}>
                  <select name="stage" defaultValue={lead.stage} onChange={() => {}} className="bg-gray-700 text-white rounded-lg px-2 py-1 text-xs border border-gray-600 focus:outline-none focus:border-indigo-500">
                    {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <button type="submit" className="ml-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors">Update</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
