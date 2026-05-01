'use client';
import { useCallback, useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'typeflow-applause-enabled';

export function useApplauseSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  // 默认开启音效，从 localStorage 读取设置
  const [enabled, setEnabled] = useState(true);

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === 'true');
    }
  }, []);

  // 切换音效开关
  const toggle = useCallback(() => {
    setEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // 创建白噪声缓冲区
  const createWhiteNoise = useCallback((ctx: AudioContext, duration: number): AudioBuffer => {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }, []);

  // 播放单次拍手声
  const playClap = useCallback((
    ctx: AudioContext,
    startTime: number,
    centerFreq: number,
    pan: number,
    gain: number
  ) => {
    const noiseBuffer = createWhiteNoise(ctx, 0.2);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // 带通滤波器
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = centerFreq;
    bandpass.Q.value = 2;

    // 增益节点（包络控制）
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

    // 声相控制
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;

    // 连接节点
    noise.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(ctx.destination);

    noise.start(startTime);
    noise.stop(startTime + 0.2);
  }, [createWhiteNoise]);

  const play = useCallback(() => {
    if (!enabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // 5次拍手叠加，时间/频率/声相/增益各异
      const claps = [
        { delay: 0.0, freqOffset: 0, pan: -0.3, gain: 0.4 },
        { delay: 0.02, freqOffset: 50, pan: 0.2, gain: 0.35 },
        { delay: 0.04, freqOffset: -30, pan: -0.5, gain: 0.38 },
        { delay: 0.06, freqOffset: 80, pan: 0.4, gain: 0.32 },
        { delay: 0.08, freqOffset: -50, pan: 0.0, gain: 0.36 },
      ];

      claps.forEach(clap => {
        const centerFreq = 1200 + clap.freqOffset + (Math.random() * 400 - 200);
        playClap(ctx, now + clap.delay, centerFreq, clap.pan, clap.gain);
      });
    } catch {
      // 静默失败，不中断用户体验
    }
  }, [enabled, playClap]);

  return { play, enabled, toggle };
}
