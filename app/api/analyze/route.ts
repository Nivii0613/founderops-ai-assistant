import { NextRequest, NextResponse } from 'next/server';
import { analyzeMessage } from '@/lib/ai/analyze';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, subject, sourceType } = await req.json();
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 });

    const result = await analyzeMessage({ text, subject, sourceType });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
