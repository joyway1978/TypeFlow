'use client';
import { useState, useCallback } from 'react';
import { sentences } from '@/lib/sentences';
import { CheckResponse, PracticePhase, WordStatus } from '@/lib/types';
import { fetchCheck } from '@/lib/api';

export function usePractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('idle');
  // @deprecated 逐词模式下不再使用此字段，保留以保持向后兼容
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<CheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordInputs, setWordInputs] = useState<string[]>([]);
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);

  const currentSentence = sentences[currentIndex] ?? null;
  const totalSentences = sentences.length;
  const isLastSentence = currentIndex >= totalSentences - 1;
  const isAllWordsDone = words.length > 0 && currentWordIndex >= words.length;

  const startListening = useCallback(() => {
    setPhase('listening');
    setFeedback(null);
    setUserInput('');
    setError(null);

    if (currentSentence) {
      const wordList = currentSentence.text.split(' ');
      setWords(wordList);
      setWordInputs(new Array(wordList.length).fill(''));
      setWordStatuses(new Array(wordList.length).fill('pending'));
      setCurrentWordIndex(0);
    }
  }, [currentSentence]);

  const startTyping = useCallback(() => {
    setPhase('typing');
  }, []);

  const updateCurrentWord = useCallback((value: string) => {
    setWordInputs(prev => {
      const next = [...prev];
      next[currentWordIndex] = value;
      return next;
    });
  }, [currentWordIndex]);

  const confirmWord = useCallback(() => {
    const input = wordInputs[currentWordIndex] ?? '';
    const target = words[currentWordIndex] ?? '';

    setWordStatuses(prev => {
      const next = [...prev];
      next[currentWordIndex] =
        input.toLowerCase() === target.toLowerCase() ? 'correct' : 'wrong';
      return next;
    });

    setCurrentWordIndex(prev => prev + 1);
  }, [wordInputs, words, currentWordIndex]);

  const goBackWord = useCallback(() => {
    if (currentWordIndex <= 0) return;
    const currentInput = wordInputs[currentWordIndex] ?? '';
    if (currentInput !== '') return;

    setCurrentWordIndex(prev => prev - 1);
    setWordInputs(prev => {
      const next = [...prev];
      next[currentWordIndex - 1] = '';
      return next;
    });
    setWordStatuses(prev => {
      const next = [...prev];
      next[currentWordIndex - 1] = 'pending';
      return next;
    });
  }, [currentWordIndex, wordInputs]);

  const submitAnswer = useCallback(async () => {
    if (!currentSentence) return;
    setIsLoading(true);
    setPhase('checking');
    setError(null);

    const fullInput = wordInputs.join(' ');

    try {
      const result = await fetchCheck(currentSentence.text, fullInput);
      setFeedback(result);
      setPhase('feedback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
      setPhase('typing');
    } finally {
      setIsLoading(false);
    }
  }, [currentSentence, wordInputs]);

  const nextSentence = useCallback(() => {
    if (isLastSentence) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    setPhase('idle');
    setFeedback(null);
    setUserInput('');
    setError(null);
    setWords([]);
    setWordInputs([]);
    setWordStatuses([]);
    setCurrentWordIndex(0);
  }, [isLastSentence]);

  return {
    currentSentence,
    currentIndex,
    totalSentences,
    phase,
    userInput,
    setUserInput,
    feedback,
    isLoading,
    error,
    isLastSentence,
    startListening,
    startTyping,
    submitAnswer,
    nextSentence,
    words,
    currentWordIndex,
    wordInputs,
    wordStatuses,
    isAllWordsDone,
    updateCurrentWord,
    confirmWord,
    goBackWord,
  };
}
