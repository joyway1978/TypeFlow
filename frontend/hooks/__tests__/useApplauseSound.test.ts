import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApplauseSound } from '../useApplauseSound';

describe('useApplauseSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Audio globally with pause method
    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    const audioMock = vi.fn().mockImplementation(() => ({
      currentTime: 0,
      volume: 0.6,
      play: playMock,
      pause: pauseMock,
    }));
    global.Audio = audioMock as any;
  });

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

  it('should toggle enabled state', () => {
    vi.spyOn(localStorage, 'getItem').mockReturnValue('true');
    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    const { result } = renderHook(() => useApplauseSound());

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.enabled).toBe(false);
    expect(setItemSpy).toHaveBeenCalledWith('typeflow-applause-enabled', 'false');
  });

  it('should play audio when enabled', () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const audioMock = vi.fn().mockImplementation(() => ({
      currentTime: 0,
      volume: 0.6,
      play: playMock,
      pause: vi.fn(),
    }));
    global.Audio = audioMock as any;

    vi.spyOn(localStorage, 'getItem').mockReturnValue('true');
    const { result } = renderHook(() => useApplauseSound());

    act(() => {
      result.current.play();
    });

    expect(audioMock).toHaveBeenCalledWith('/sounds/applause.mp3');
    expect(playMock).toHaveBeenCalled();
  });

  it('should not play audio when disabled', () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    const audioMock = vi.fn().mockImplementation(() => ({
      currentTime: 0,
      volume: 0.6,
      play: playMock,
      pause: vi.fn(),
    }));
    global.Audio = audioMock as any;

    vi.spyOn(localStorage, 'getItem').mockReturnValue('false');
    const { result } = renderHook(() => useApplauseSound());

    // Reset the mock to ignore the initialization call
    audioMock.mockClear();

    act(() => {
      result.current.play();
    });

    expect(playMock).not.toHaveBeenCalled();
  });
});
