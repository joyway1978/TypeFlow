'use client';
import { useRef, useEffect } from 'react';

interface WordInputProps {
  targetWord: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onGoBack: () => void;
  disabled?: boolean;
}

export function WordInput({
  targetWord,
  value,
  onChange,
  onConfirm,
  onGoBack,
  disabled = false,
}: WordInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (!disabled && value.trim().length > 0) {
        onConfirm();
      }
      return;
    }

    if (e.key === 'Backspace' && value === '' && !disabled) {
      e.preventDefault();
      onGoBack();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={targetWord}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full bg-transparent px-0 py-2 font-mono text-input text-ink placeholder:text-ink-faded/50 outline-none transition-colors duration-200 border-b-[1.5px] border-paper-edge focus:border-b-2 focus:border-bookmark-gold disabled:opacity-50"
        aria-label={`Type the word: ${targetWord}`}
      />
    </div>
  );
}
