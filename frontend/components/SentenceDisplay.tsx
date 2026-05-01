'use client';
import type { WordStatus } from '@/lib/types';

interface SentenceDisplayProps {
  words: string[];
  currentWordIndex: number;
  wordStatuses: WordStatus[];
  dimmed?: boolean;
}

export function SentenceDisplay({
  words,
  currentWordIndex,
  wordStatuses,
  dimmed = false,
}: SentenceDisplayProps) {
  if (words.length === 0) {
    return (
      <p className="text-center text-ink-faded">No sentence loaded.</p>
    );
  }

  return (
    <p
      className={`text-center font-serif text-xl leading-relaxed transition-opacity duration-200 md:text-2xl ${
        dimmed ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {words.map((word, index) => {
        const status = wordStatuses[index] ?? 'pending';
        const isCurrent = index === currentWordIndex;

        let className = '';

        if (status === 'correct') {
          className = 'text-correct-ink';
        } else if (status === 'wrong') {
          className = 'text-teacher-red';
        } else if (isCurrent) {
          className = 'text-bookmark-gold border-b-2 border-bookmark-gold';
        } else {
          className = 'text-ink-faded';
        }

        return (
          <span key={index}>
            <span className={className}>{word}</span>
            {index < words.length - 1 && ' '}
          </span>
        );
      })}
    </p>
  );
}
