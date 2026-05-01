'use client';
import { CheckSummary } from '@/lib/types';

interface StatsBarProps {
  summary: CheckSummary;
}

export function StatsBar({ summary }: StatsBarProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-4 font-serif text-sm text-ink-faded">
      <span className="text-correct-ink">✓ {summary.correctCount}</span>
      <span className="text-pencil-grey">~ {summary.ignoredCount}</span>
      <span className="text-teacher-red">✗ {summary.wrongCount}</span>
    </div>
  );
}
