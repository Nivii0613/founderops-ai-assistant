import OpenAI from 'openai';
import { aiAnalysisResultSchema } from '@/lib/validations';
import type { AiAnalysisResult } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant helping a solo founder manage their startup workflow.
Analyze the given message and return a JSON object with exactly these fields:
- category: one of [lead, support, product_feedback, admin, content, personal, other]
- priority: one of [low, medium, high]
- summary: a 1-2 sentence summary of what this message is about (max 200 chars)
- suggested_action: what the founder should do next (max 300 chars)
- draft_reply: a short, professional, founder-like reply (max 500 chars). If no reply needed, say "No reply needed."

Rules:
- Output valid JSON only. No markdown, no code blocks, no extra text.
- Do not hallucinate facts not in the message.
- If uncertain about category, use "other".
- Keep replies concise and direct — founders are busy.
- For partnership inquiries, prioritize appropriately.
- For support issues, be empathetic but clear.`;

export async function analyzeInboxItem(
  rawText: string,
  subject: string,
  sourceType: string
): Promise<AiAnalysisResult | { error: string }> {
  const userMessage = `Source type: ${sourceType}\nSubject: ${subject}\n\nMessage:\n${rawText}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return { error: 'No response from AI' };

    const parsed = JSON.parse(raw);
    const validated = aiAnalysisResultSchema.safeParse(parsed);

    if (!validated.success) {
      console.error('AI response validation failed:', validated.error);
      // Attempt graceful fallback - use raw values but ensure strings exist
      return {
        category: parsed.category ?? 'other',
        priority: parsed.priority ?? 'medium',
        summary: parsed.summary ?? 'Could not parse summary.',
        suggested_action: parsed.suggested_action ?? 'Review manually.',
        draft_reply: parsed.draft_reply ?? '',
      };
    }

    return validated.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    console.error('AI analysis error:', message);
    return { error: message };
  }
}
