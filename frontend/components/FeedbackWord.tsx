'use client';
import { TokenStatus } from '@/lib/types';

interface FeedbackWordProps {
  targetToken: string;
  userToken: string | null;
  status: TokenStatus;
  index: number;
}

const statusStyles: Record<TokenStatus, string> = {
  correct: 'text-correct-ink',
  ignored_by_case_or_punct: 'text-pencil-grey',
  wrong: 'text-teacher-red',
};

const statusIcons: Record<TokenStatus, string> = {
  correct: '✓',
  ignored_by_case_or_punct: '~',
  wrong: '✗',
};

export function FeedbackWord({ targetToken, userToken, status, index }: FeedbackWordProps) {
  const isWrong = status === 'wrong';
  const isIgnored = status === 'ignored_by_case_or_punct';

  return (
    <span
      className="feedback-word inline-flex flex-col items-center px-[3px]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className={`font-mono text-lg ${statusStyles[status]} ${isWrong ? 'border-b-2 border-teacher-red' : ''}`}>
        {targetToken}
      </span>

      <span className={`text-xs leading-none ${statusStyles[status]}`}>
        {statusIcons[status]}
      </span>

      {(isWrong || isIgnored) && userToken && (
        <span className={`text-xs ${statusStyles[status]} opacity-70`}>
          ({userToken})
        </span>
      )}
    </span>
  );
}
