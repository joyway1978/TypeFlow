'use client';
import { useCallback } from 'react';
import { usePractice } from '@/hooks/usePractice';
import { useAudio } from '@/hooks/useAudio';
import { PaperSheet } from '@/components/PaperSheet';
import { SentenceDisplay } from '@/components/SentenceDisplay';
import { PlayButton } from '@/components/PlayButton';
import { TypingInput } from '@/components/TypingInput';
import { SubmitButton } from '@/components/SubmitButton';
import { FeedbackReport } from '@/components/FeedbackReport';
import { StatsBar } from '@/components/StatsBar';
import { ProgressBar } from '@/components/ProgressBar';
import { NextButton } from '@/components/NextButton';

export default function Home() {
  const {
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
  } = usePractice();

  const { play: playAudio, replay, isPlaying, isLoading: audioLoading } = useAudio();

  const handlePlay = useCallback(async () => {
    if (!currentSentence) return;
    startListening();
    await playAudio(currentSentence.text);
    startTyping();
  }, [currentSentence, playAudio, startListening, startTyping]);

  const handleReplay = useCallback(() => {
    replay();
  }, [replay]);

  const handleSubmit = useCallback(() => {
    if (userInput.trim()) {
      submitAnswer();
    }
  }, [userInput, submitAnswer]);

  const handleNext = useCallback(() => {
    nextSentence();
  }, [nextSentence]);

  const showSentence = phase === 'idle' || phase === 'listening';
  const showPlayButton = phase === 'idle' || phase === 'listening' || phase === 'typing';
  const showInput = phase === 'typing' || phase === 'checking';
  const showSubmit = phase === 'typing' && userInput.trim().length > 0;
  const showFeedback = phase === 'feedback' && feedback;
  const showNext = phase === 'feedback';
  const isInputDimmed = phase === 'typing';

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8 md:px-12 md:py-16">
      <h1 className="mb-8 font-brand text-display text-ink">
        TypeFlow
      </h1>

      <PaperSheet className="px-8 py-8 md:px-10 md:py-10">
        {showSentence && (
          <div className="mb-6">
            <SentenceDisplay
              sentence={currentSentence?.text ?? null}
              dimmed={isInputDimmed}
            />
          </div>
        )}

        {showPlayButton && (
          <div className="mb-6">
            <PlayButton
              isPlaying={isPlaying}
              isLoading={audioLoading}
              onClick={isPlaying ? handleReplay : handlePlay}
            />
          </div>
        )}

        {showInput && (
          <div className="mb-2">
            <TypingInput
              value={userInput}
              onChange={setUserInput}
              disabled={isLoading}
              onSubmit={handleSubmit}
              placeholder="Start typing what you heard..."
            />
          </div>
        )}

        {showSubmit && (
          <SubmitButton
            onClick={handleSubmit}
            disabled={userInput.trim().length === 0}
            isLoading={isLoading}
          />
        )}

        {error && (
          <p className="mt-4 text-center font-serif text-sm text-teacher-red">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="mt-6 text-center font-serif text-sm text-ink-faded">
            Checking your answer...
          </p>
        )}

        {showFeedback && (
          <FeedbackReport feedback={feedback} />
        )}

        {showFeedback && feedback && (
          <StatsBar summary={feedback.summary} />
        )}

        {showNext && (
          <NextButton onClick={handleNext} isLast={isLastSentence} />
        )}
      </PaperSheet>

      {currentSentence && (
        <div className="mt-6">
          <ProgressBar current={currentIndex + 1} total={totalSentences} />
        </div>
      )}

      <p className="mt-8 font-serif text-xs text-ink-faded">
        Press Enter to submit &middot; Listen, type, learn.
      </p>
    </main>
  );
}
