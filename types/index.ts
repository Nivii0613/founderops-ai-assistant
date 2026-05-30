export * from './database';

export interface AiAnalysisResult {
  category: string;
  priority: string;
  summary: string;
  suggested_action: string;
  draft_reply: string;
}
