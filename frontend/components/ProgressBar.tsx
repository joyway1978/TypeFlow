'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="font-serif text-xs text-ink-faded">
        {current} / {total}
      </span>
      <div className="h-[2px] w-32 overflow-hidden rounded-full bg-paper-edge">
        <div
          className="h-full bg-bookmark-gold transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
