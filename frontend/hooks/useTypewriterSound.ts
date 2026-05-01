'use client';
import { useCallback, useRef } from 'react';

export function useTypewriterSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playKeySound = useCallback(() => {
    // 创建音频上下文（如果还没有）
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 创建振荡器 - 使用方波模拟机械键盘的"咔嗒"声
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    // 随机频率变化，模拟不同按键的细微差别
    const baseFreq = 800 + Math.random() * 200;
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    // 音量包络 - 短促的衰减
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, []);

  return { playKeySound };
}
