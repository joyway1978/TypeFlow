'use client';
import { useRef, useEffect } from 'react';

interface TypingInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSubmit?: () => void;
  placeholder?: string;
}

export function TypingInput({
  value,
  onChange,
  disabled = false,
  onSubmit,
  placeholder = 'Start typing...',
}: TypingInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none bg-transparent px-0 py-2 font-mono text-input text-ink placeholder:text-ink-faded/50 outline-none transition-colors duration-200 border-b-[1.5px] border-paper-edge focus:border-b-2 focus:border-bookmark-gold disabled:opacity-50"
        aria-label="Type the sentence you hear"
      />
    </div>
  );
}
