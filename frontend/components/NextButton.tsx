'use client';

interface NextButtonProps {
  onClick: () => void;
  isLast: boolean;
}

export function NextButton({ onClick, isLast }: NextButtonProps) {
  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={onClick}
        className="font-serif text-sm text-bookmark-gold transition-colors duration-150 hover:text-bookmark-gold-hover"
      >
        [ {isLast ? 'start over ↻' : 'next sentence →'} ]
      </button>
    </div>
  );
}
