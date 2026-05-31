import { createClient } from '@/lib/supabase/server';
import { createNoteAction, deleteNoteAction } from '@/lib/actions/notes';
import type { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Note[]>();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Notes</h2>
        <p className="text-gray-400 mt-1">Capture ideas, insights, and founder thoughts</p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Plus size={16} /> New Note</h3>
        <form action={createNoteAction}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input name="title" required placeholder="Note title" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Content *</label>
            <textarea name="body" required rows={5} placeholder="Write your note here..." className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
            <input name="tags" placeholder="ideas, strategy, product" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save Note</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!notes?.length && (
          <div className="col-span-full text-center py-12 text-gray-500">No notes yet. Write your first one above.</div>
        )}
        {notes?.map((note) => (
          <div key={note.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h4 className="text-white font-semibold text-sm flex-1">{note.title}</h4>
              <form action={deleteNoteAction.bind(null, note.id)}>
                <button type="submit" className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
            <p className="text-gray-300 text-sm flex-1 line-clamp-4 whitespace-pre-wrap">{note.body}</p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {note.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
            <p className="text-gray-600 text-xs mt-3">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
