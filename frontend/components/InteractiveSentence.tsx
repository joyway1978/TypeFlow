'use client';
import { useRef, useEffect } from 'react';
import type { WordStatus } from '@/lib/types';

interface InteractiveSentenceProps {
  words: string[];
  currentWordIndex: number;
  wordInputs: string[];
  wordStatuses: WordStatus[];
  onChange: (value: string) => void;
  onConfirm: () => void;
  onGoBack: () => void;
  disabled?: boolean;
}

export function InteractiveSentence({
  words,
  currentWordIndex,
  wordInputs,
  wordStatuses,
  onChange,
  onConfirm,
  onGoBack,
  disabled = false,
}: InteractiveSentenceProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, currentWordIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (!disabled && wordInputs[currentWordIndex]?.trim().length > 0) {
        onConfirm();
      }
      return;
    }

    if (e.key === 'Backspace' && wordInputs[currentWordIndex] === '' && !disabled) {
      e.preventDefault();
      onGoBack();
    }
  };

  if (words.length === 0) {
    return (
      <p className="text-center text-ink-faded">No sentence loaded.</p>
    );
  }

  return (
    <p className="text-center font-serif text-xl leading-relaxed md:text-2xl">
      {words.map((word, index) => {
        const status = wordStatuses[index] ?? 'pending';
        const isCurrent = index === currentWordIndex;

        // 已完成词：显示用户输入
        if (status === 'correct') {
          return (
            <span key={index}>
              <span className="text-correct-ink">{wordInputs[index]}</span>
              {index < words.length - 1 && ' '}
            </span>
          );
        }

        // 错误词：显示用户输入
        if (status === 'wrong') {
          return (
            <span key={index}>
              <span className="text-teacher-red">{wordInputs[index]}</span>
              {index < words.length - 1 && ' '}
            </span>
          );
        }

        // 当前词：内嵌输入框
        if (isCurrent) {
          const inputWidth = `${word.length + 1}ch`;
          return (
            <span key={index}>
              <input
                ref={inputRef}
                type="text"
                value={wordInputs[index] ?? ''}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="inline-block bg-transparent font-mono text-ink outline-none border-b-2 border-bookmark-gold focus:border-bookmark-gold px-0 py-0"
                style={{ width: inputWidth, minWidth: '2ch' }}
                aria-label={`Type the word: ${word}`}
              />
              {index < words.length - 1 && ' '}
            </span>
          );
        }

        // 待处理词：下划线占位符
        const placeholderWidth = `${word.length}ch`;
        return (
          <span key={index}>
            <span
              className="inline-block border-b-2 border-paper-edge"
              style={{ width: placeholderWidth, minWidth: '2ch' }}
            />
            {index < words.length - 1 && ' '}
          </span>
        );
      })}
    </p>
  );
}
