'use client';
import { useCallback, useRef, useState, useEffect } from 'react';

const STORAGE_KEY = 'typeflow-sound-enabled';

export function useTypewriterSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  // 默认关闭音效，从 localStorage 读取设置
  const [enabled, setEnabled] = useState(false);

  // 初始化时从 localStorage 读取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === 'true');
    }
  }, []);

  // 切换音效开关
  const toggleSound = useCallback(() => {
    setEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const playKeySound = useCallback(() => {
    // 音效默认关闭
    if (!enabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 1. 低频 "thock" 声 - 模拟键帽触底
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // 2. 高频 "click" 声 - 模拟开关触发
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(600 + Math.random() * 100, now);
    clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.02);
    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);

    // 3. 噪声层 - 模拟机械结构碰撞
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 1;
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    noise.buffer = buffer;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }, [enabled]);

  return { playKeySound, enabled, toggleSound };
}
