export type WordStatus = 'pending' | 'correct' | 'ignored_by_case_or_punct' | 'wrong';

export type TokenStatus = 'correct' | 'ignored_by_case_or_punct' | 'wrong';

export interface CheckReportItem {
  targetToken: string;
  userToken: string | null;
  status: TokenStatus;
}

export interface CheckItem {
  word: string;
  user_input: string;
  status: 'correct' | 'wrong' | 'ignored';
  index: number;
}

export interface CheckSummary {
  correctCount: number;
  ignoredCount: number;
  wrongCount: number;
}

export interface CheckResultSummary {
  total: number;
  correctCount: number;
  wrongCount: number;
  ignoredCount: number;
}

export interface CheckResponse {
  normalizedTargetTokens?: string[];
  normalizedUserTokens?: string[];
  report?: CheckReportItem[];
  summary?: CheckSummary | CheckResultSummary;
  items?: CheckItem[];
}

export interface TTSResponse {
  audioUrl: string;
  audio_key?: string;
  url?: string;
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
