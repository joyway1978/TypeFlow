'use client';
import { useState, useCallback } from 'react';
import { sentences } from '@/lib/sentences';
import { CheckResponse, PracticePhase } from '@/lib/types';
import { fetchCheck } from '@/lib/api';

export function usePractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<CheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSentence = sentences[currentIndex] ?? null;
  const totalSentences = sentences.length;
  const isLastSentence = currentIndex >= totalSentences - 1;

  const startListening = useCallback(() => {
    setPhase('listening');
    setFeedback(null);
    setUserInput('');
    setError(null);
  }, []);

  const startTyping = useCallback(() => {
    setPhase('typing');
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!currentSentence) return;
    setIsLoading(true);
    setPhase('checking');
    setError(null);

    try {
      const result = await fetchCheck(currentSentence.text, userInput);
      setFeedback(result);
      setPhase('feedback');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
      setPhase('typing');
    } finally {
      setIsLoading(false);
    }
  }, [currentSentence, userInput]);

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
  };
}
