'use client';

interface SentenceDisplayProps {
  sentence: string | null;
  dimmed?: boolean;
}

export function SentenceDisplay({ sentence, dimmed = false }: SentenceDisplayProps) {
  if (!sentence) {
    return (
      <p className="text-center text-ink-faded">No sentence loaded.</p>
    );
  }

  return (
    <p
      className={`text-center font-serif text-xl leading-relaxed text-ink transition-opacity duration-200 md:text-2xl ${
        dimmed ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {sentence}
    </p>
  );
}
