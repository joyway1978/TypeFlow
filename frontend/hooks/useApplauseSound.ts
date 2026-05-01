'use client';
import { useCallback, useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'typeflow-applause-enabled';

export function useApplauseSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 默认开启音效，从 localStorage 读取设置
  const [enabled, setEnabled] = useState(true);

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === 'true');
    }
  }, []);

  // 初始化音频元素
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/applause.mp3');
      audioRef.current.volume = 0.6;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 切换音效开关
  const toggleSound = useCallback(() => {
    setEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;

    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // 静默失败（可能是浏览器自动播放策略）
        });
      }
    } catch {
      // 静默失败，不中断用户体验
    }
  }, [enabled]);

  return { play, enabled, toggleSound };
}
