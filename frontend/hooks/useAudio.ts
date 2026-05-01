'use client';
import { useRef, useState, useCallback } from 'react';
import { fetchTTS, getAudioUrl } from '@/lib/api';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const play = useCallback(async (text: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const { audioUrl } = await fetchTTS(text);
      const fullUrl = getAudioUrl(audioUrl);
      const audio = new Audio(fullUrl);
      audioRef.current = audio;

      // Wait for onended — audio.play() resolves when playback starts, not ends
      await new Promise<void>((resolve, reject) => {
        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };
        audio.onended = () => {
          setIsPlaying(false);
          resolve();
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
    } catch (err) {
      console.error('Audio playback failed:', err);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, []);

  const replay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, []);

  return { play, replay, isPlaying, isLoading };
}
