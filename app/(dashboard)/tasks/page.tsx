import { createClient } from '@/lib/supabase/server';
import { createTaskAction, updateTaskStatusAction } from '@/lib/actions/tasks';
import type { Task } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-yellow-500/20 text-yellow-300',
  done: 'bg-green-500/20 text-green-300',
};

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Task[]>();

  const open = tasks?.filter(t => t.status !== 'done') ?? [];
  const done = tasks?.filter(t => t.status === 'done') ?? [];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Tasks</h2>
        <p className="text-gray-400 mt-1">{open.length} open, {done.length} completed</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Plus size={16} /> New Task</h3>
        <form action={createTaskAction}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Title *</label>
              <input name="title" required placeholder="Task title" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <select name="priority" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input name="due_date" type="date" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea name="description" rows={2} placeholder="Optional details..." className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Task</button>
        </form>
      </div>

      <div className="space-y-3">
        {!tasks?.length && (
          <div className="text-center py-12 text-gray-500">No tasks yet. Create your first one above.</div>
        )}
        {[...open, ...done].map((task) => (
          <div key={task.id} className={`bg-gray-800 rounded-xl border p-5 ${task.status === 'done' ? 'border-gray-700 opacity-60' : 'border-gray-700'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status] ?? ''}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] ?? ''}`}>{task.priority}</span>
                </div>
                <h4 className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</h4>
                {task.description && <p className="text-gray-400 text-sm mt-1">{task.description}</p>}
                {task.due_date && <p className="text-xs text-gray-500 mt-1">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
                <p className="text-gray-600 text-xs mt-1">{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</p>
              </div>
              <div className="flex flex-col gap-1">
                {task.status !== 'done' && (
                  <form action={updateTaskStatusAction.bind(null, task.id, 'done')}>
                    <button type="submit" className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors">Done</button>
                  </form>
                )}
                {task.status === 'open' && (
                  <form action={updateTaskStatusAction.bind(null, task.id, 'in_progress')}>
                    <button type="submit" className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors">In Progress</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
