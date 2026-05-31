import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from '@/lib/actions/dashboard';
import Link from 'next/link';
import { Inbox, Users, CheckSquare, FileText, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const stats = await getDashboardStats();

  const cards = [
    { title: 'Inbox Items', value: stats?.inboxCount ?? 0, newCount: stats?.newInboxCount ?? 0, href: '/inbox', icon: Inbox, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Leads', value: stats?.leadsCount ?? 0, newCount: stats?.newLeadsCount ?? 0, href: '/leads', icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Open Tasks', value: stats?.openTasksCount ?? 0, newCount: stats?.highPriorityTasksCount ?? 0, href: '/tasks', icon: CheckSquare, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Notes', value: stats?.notesCount ?? 0, newCount: 0, href: '/notes', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Welcome back {user?.email?.split('@')[0]} </h2>
        <p className="text-gray-400 mt-1">Your startup command center.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {cards.map(({ title, value, newCount, href, icon: Icon, color, bg }) => (
          <Link key={href} href={href} className="block bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm font-medium">{title}</span>
              <div className={`${bg} p-2 rounded-lg`}><Icon size={18} className={color} /></div>
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
            {newCount > 0 && <div className="mt-2 text-xs text-indigo-400">{newCount} new</div>}
          </Link>
        ))}
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-indigo-400" />
          <h3 className="text-white font-semibold">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/inbox" className="flex items-center gap-2 bg-gray-700 hover:bg-indigo-600 text-gray-200 hover:text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"><Inbox size={16} /> Add Inbox Item</Link>
          <Link href="/tasks" className="flex items-center gap-2 bg-gray-700 hover:bg-indigo-600 text-gray-200 hover:text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"><CheckSquare size={16} /> Create Task</Link>
          <Link href="/notes" className="flex items-center gap-2 bg-gray-700 hover:bg-indigo-600 text-gray-200 hover:text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors"><FileText size={16} /> Write Note</Link>
        </div>
      </div>
    </div>
  );
}
