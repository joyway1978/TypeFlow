import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApplauseSound } from '../useApplauseSound';

// Type definition for Audio mock
interface MockAudioInstance {
  currentTime: number;
  volume: number;
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
}

type AudioConstructor = new (src: string) => MockAudioInstance;

describe('useApplauseSound', () => {
  let playMock: ReturnType<typeof vi.fn>;
  let audioMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Audio mock
    playMock = vi.fn().mockResolvedValue(undefined);
    audioMock = vi.fn().mockImplementation(
      (): MockAudioInstance => ({
        currentTime: 0,
        volume: 0.6,
        play: playMock,
        pause: vi.fn(),
      })
    );

    global.Audio = audioMock as unknown as AudioConstructor;
  });

  describe('initialization', () => {
    it('should initialize with enabled=true by default', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
      const { result } = renderHook(() => useApplauseSound());
      expect(result.current.enabled).toBe(true);
    });

    it('should read enabled state from localStorage', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('false');
      const { result } = renderHook(() => useApplauseSound());
      expect(result.current.enabled).toBe(false);
    });
  });

  describe('toggleSound', () => {
    it('should toggle enabled state and persist to localStorage', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('true');
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      const { result } = renderHook(() => useApplauseSound());

      act(() => {
        result.current.toggleSound();
      });

      expect(result.current.enabled).toBe(false);
      expect(setItemSpy).toHaveBeenCalledWith('typeflow-applause-enabled', 'false');
    });
  });

  describe('play', () => {
    it('should play audio when enabled', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('true');
      const { result } = renderHook(() => useApplauseSound());

      act(() => {
        result.current.play();
      });

      // Audio should be created (at least once during init, once during play)
      expect(audioMock).toHaveBeenCalledWith('/sounds/applause.mp3');
      // Play should be called
      expect(playMock).toHaveBeenCalled();
    });

    it('should not play audio when disabled', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('false');
      const { result } = renderHook(() => useApplauseSound());

      // Get the current call count after initialization
      const callCountBefore = audioMock.mock.calls.length;

      act(() => {
        result.current.play();
      });

      // No new Audio instances should be created after play()
      expect(audioMock.mock.calls.length).toBe(callCountBefore);
      expect(playMock).not.toHaveBeenCalled();
    });
  });
});
