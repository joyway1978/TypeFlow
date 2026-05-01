'use client';

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export function PlayButton({ isPlaying, isLoading, onClick }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bookmark-gold text-ink transition-colors duration-150 hover:bg-bookmark-gold-hover disabled:opacity-60"
      aria-label={isPlaying ? 'Playing audio...' : 'Play sentence audio'}
    >
      {isLoading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      ) : isPlaying ? (
        <div className="flex h-5 items-end gap-[3px]">
          <span className="w-[3px] animate-[soundWave_0.6s_ease-in-out_infinite] rounded-full bg-ink" style={{ height: '16px', animationDelay: '0s' }} />
          <span className="w-[3px] animate-[soundWave_0.6s_ease-in-out_infinite] rounded-full bg-ink" style={{ height: '20px', animationDelay: '0.15s' }} />
          <span className="w-[3px] animate-[soundWave_0.6s_ease-in-out_infinite] rounded-full bg-ink" style={{ height: '12px', animationDelay: '0.3s' }} />
        </div>
      ) : (
        <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
