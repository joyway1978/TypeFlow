export type WordStatus = 'pending' | 'correct' | 'wrong';

export type TokenStatus = 'correct' | 'ignored_by_case_or_punct' | 'wrong';

export interface CheckReportItem {
  targetToken: string;
  userToken: string | null;
  status: TokenStatus;
}

export interface CheckSummary {
  correctCount: number;
  ignoredCount: number;
  wrongCount: number;
}

export interface CheckResponse {
  normalizedTargetTokens: string[];
  normalizedUserTokens: string[];
  report: CheckReportItem[];
  summary: CheckSummary;
}

export interface TTSResponse {
  audioUrl: string;
}

export interface Sentence {
  id: number;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type PracticePhase = 'idle' | 'listening' | 'typing' | 'checking' | 'feedback';

export interface PracticeState {
  phase: PracticePhase;
  currentSentenceIndex: number;
  userInput: string;
  feedback: CheckResponse | null;
  isLoading: boolean;
  error: string | null;
}
