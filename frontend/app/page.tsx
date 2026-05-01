'use client';
import { useCallback, useEffect, useRef } from 'react';
import { usePractice } from '@/hooks/usePractice';
import { useAudio } from '@/hooks/useAudio';
import { PaperSheet } from '@/components/PaperSheet';
import { InteractiveSentence } from '@/components/InteractiveSentence';
import { PlayButton } from '@/components/PlayButton';
import { ReplayButton } from '@/components/ReplayButton';
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
  } = usePractice();

  const { play: playAudio, replay, isPlaying, isLoading: audioLoading } = useAudio();

  const submittedRef = useRef(false);

  useEffect(() => {
    if (isAllWordsDone && phase === 'typing' && !submittedRef.current) {
      submittedRef.current = true;
      submitAnswer();
    }
  }, [isAllWordsDone, phase, submitAnswer]);

  useEffect(() => {
    if (phase !== 'typing') {
      submittedRef.current = false;
    }
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'feedback' && e.key === 'Enter') {
        e.preventDefault();
        nextSentence();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, nextSentence]);

  const handlePlay = useCallback(async () => {
    if (!currentSentence) return;
    startListening();
    await playAudio(currentSentence.text);
    startTyping();
  }, [currentSentence, playAudio, startListening, startTyping]);

  const handleReplay = useCallback(() => {
    replay();
  }, [replay]);

  const handleNext = useCallback(() => {
    nextSentence();
  }, [nextSentence]);

  const showPlayButton = phase === 'idle';
  const showInput = phase === 'typing' || phase === 'listening';
  const showFeedback = phase === 'feedback' && feedback;
  const showNext = phase === 'feedback';
  const showReplay = phase === 'listening' || phase === 'typing' || phase === 'feedback';

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8 md:px-12 md:py-16">
      <h1 className="mb-8 font-brand text-display text-ink">
        TypeFlow
      </h1>

      <PaperSheet className="px-8 py-8 md:px-10 md:py-10">
        {showInput && (
          <div className="mb-6">
            <InteractiveSentence
              words={words}
              currentWordIndex={currentWordIndex}
              wordInputs={wordInputs}
              wordStatuses={wordStatuses}
              onChange={updateCurrentWord}
              onConfirm={confirmWord}
              onGoBack={goBackWord}
              disabled={isLoading || phase === 'listening'}
            />
          </div>
        )}

        {showPlayButton && (
          <div className="mb-6">
            <PlayButton
              isPlaying={isPlaying}
              isLoading={audioLoading}
              onClick={handlePlay}
            />
          </div>
        )}

        {showReplay && (
          <div className="mb-6 flex justify-center">
            <ReplayButton
              onClick={handleReplay}
              disabled={isPlaying || audioLoading}
            />
          </div>
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
        Press Space to confirm &middot; Backspace to go back &middot; Enter for next
      </p>
    </main>
  );
}
