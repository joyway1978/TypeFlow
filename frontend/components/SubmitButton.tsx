'use client';

interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SubmitButton({ onClick, disabled = false, isLoading = false }: SubmitButtonProps) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="font-serif text-sm text-bookmark-gold transition-colors duration-150 hover:text-bookmark-gold-hover disabled:opacity-40"
      >
        {isLoading ? '[ checking... ]' : '[ submit → ]'}
      </button>
    </div>
  );
}
