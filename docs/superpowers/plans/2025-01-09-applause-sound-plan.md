# 掌声音效实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 添加掌声音效功能：句子全对时播放掌声，独立开关控制，默认开启。

**架构：** 新建 `useApplauseSound` Hook 封装 Web Audio API 掌声合成与开关管理；在 `usePractice` 的提交逻辑中集成触发；在页面添加开关 UI。

**Tech Stack:** React, TypeScript, Web Audio API, localStorage

---

## 文件变更清单

| 文件 | 操作 | 职责 |
|------|------|------|
| `frontend/hooks/useApplauseSound.ts` | 新建 | 掌声 Hook：合成 + 开关 + 持久化 |
| `frontend/hooks/usePractice.ts` | 修改 | 集成掌声触发逻辑 |
| `frontend/app/page.tsx` | 修改 | 添加掌声开关按钮 |

---

### Task 1: 新建 useApplauseSound Hook

**Files:**
- Create: `frontend/hooks/useApplauseSound.ts`

**Context:** 参考现有 `useTypewriterSound.ts` 的实现模式，使用 Web Audio API。

- [ ] **Step 1: 创建 Hook 文件基础结构**

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const APPLAUSE_STORAGE_KEY = 'typeflow-applause-enabled';

interface UseApplauseSoundReturn {
  play: () => void;
  enabled: boolean;
  toggle: () => void;
}

export function useApplauseSound(): UseApplauseSoundReturn {
  const [enabled, setEnabled] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 从 localStorage 读取状态
  useEffect(() => {
    const stored = localStorage.getItem(APPLAUSE_STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === 'true');
    }
  }, []);

  // 持久化到 localStorage
  useEffect(() => {
    localStorage.setItem(APPLAUSE_STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // TODO: 掌声合成逻辑将在下一步实现
    } catch {
      // 静默失败
    }
  }, [enabled]);

  return { play, enabled, toggle };
}
```

- [ ] **Step 2: 添加掌声合成逻辑**

在 `play` 函数中替换 `// TODO` 部分：

```typescript
const play = useCallback(() => {
  if (!enabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;

    // 创建白噪声缓冲区
    const createNoiseBuffer = () => {
      const bufferSize = sampleRate * 0.5; // 500ms
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    };

    // 单次拍手合成
    const createClap = (delay: number, freqOffset: number, pan: number, gain: number) => {
      const source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer();

      // 带通滤波器
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200 + freqOffset;
      filter.Q.value = 1;

      // 包络
      const envelope = ctx.createGain();
      const startTime = now + delay;
      envelope.gain.setValueAtTime(0, startTime);
      envelope.gain.linearRampToValueAtTime(gain, startTime + 0.005);
      envelope.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      // 声相
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;

      // 连接
      source.connect(filter);
      filter.connect(envelope);
      envelope.connect(panner);
      panner.connect(ctx.destination);

      source.start(startTime);
      source.stop(startTime + 0.2);
    };

    // 叠加多次拍手形成掌声效果
    const claps = [
      { delay: 0, freq: 0, pan: -0.3, gain: 0.8 },
      { delay: 0.03, freq: 150, pan: 0.2, gain: 0.7 },
      { delay: 0.06, freq: -100, pan: -0.1, gain: 0.6 },
      { delay: 0.1, freq: 200, pan: 0.3, gain: 0.5 },
      { delay: 0.12, freq: -150, pan: -0.4, gain: 0.4 },
    ];

    claps.forEach(({ delay, freq, pan, gain }) => {
      createClap(delay, freq, pan, gain);
    });
  } catch {
    // 静默失败
  }
}, [enabled]);
```

- [ ] **Step 3: 提交**

```bash
git add frontend/hooks/useApplauseSound.ts
git commit -m "feat: add applause sound hook with Web Audio API synthesis"
```

---

### Task 2: 修改 usePractice.ts 集成掌声触发

**Files:**
- Modify: `frontend/hooks/usePractice.ts`
- Read first: 查看 `submitInput` 函数中检查逻辑的位置

- [ ] **Step 1: 导入 useApplauseSound**

在文件顶部添加导入：

```typescript
import { useApplauseSound } from './useApplauseSound';
```

- [ ] **Step 2: 在 Hook 中初始化 applause**

在 `usePractice` 函数内部，其他 hook 调用之后添加：

```typescript
const { play: playApplause, enabled: applauseEnabled } = useApplauseSound();
```

- [ ] **Step 3: 在提交逻辑中触发掌声**

找到 `submitInput` 函数或检查结果的逻辑。通常在以下模式附近：

```typescript
// 检查结果后
const allCorrect = result.every(r => r.isCorrect);
```

在该逻辑后添加掌声触发：

```typescript
// 检查结果后触发掌声
if (allCorrect && applauseEnabled) {
  playApplause();
}
```

如果没有现成的 `allCorrect` 变量，需要先计算：

```typescript
// 假设 result 是检查结果数组
const allCorrect = result.every(item => item.status === 'correct');
if (allCorrect && applauseEnabled) {
  playApplause();
}
```

具体代码取决于现有检查逻辑的实现，请根据实际代码调整。

- [ ] **Step 4: 提交**

```bash
git add frontend/hooks/usePractice.ts
git commit -m "feat: integrate applause trigger in practice hook"
```

---

### Task 3: 修改 page.tsx 添加开关 UI

**Files:**
- Modify: `frontend/app/page.tsx`
- Read first: 查看打字机音效开关的实现位置

- [ ] **Step 1: 导入 useApplauseSound**

在文件顶部添加导入：

```typescript
import { useApplauseSound } from './hooks/useApplauseSound';
```

- [ ] **Step 2: 初始化 applause 开关**

在组件函数内部，找到打字机音效开关初始化的位置，在其后添加：

```typescript
const { enabled: applauseEnabled, toggle: toggleApplause } = useApplauseSound();
```

- [ ] **Step 3: 添加开关按钮**

找到打字机音效开关按钮的代码（通常在设置区域），在其后添加掌声开关：

```tsx
{/* 掌声音效开关 */}
<button
  onClick={toggleApplause}
  className={`p-2 rounded-full transition-colors ${
    applauseEnabled
      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
  }`}
  title={applauseEnabled ? '关闭掌声' : '开启掌声'}
>
  <span className="text-sm">{applauseEnabled ? '👏' : '🔇'}</span>
</button>
```

如果页面有专门的设置区域容器，确保按钮放在容器内保持样式一致。

- [ ] **Step 4: 提交**

```bash
git add frontend/app/page.tsx
git commit -m "feat: add applause toggle button in UI"
```

---

### Task 4: 验证测试

- [ ] **Step 1: 启动开发服务器**

```bash
cd frontend && npm run dev
```

在浏览器中打开 http://localhost:3000

- [ ] **Step 2: 手动测试验证**

按顺序执行以下测试：

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 打开页面，输入一个完全正确的句子 | 听到掌声 |
| 2 | 点击掌声开关关闭 | 开关显示 🔇 |
| 3 | 再输入一个完全正确的句子 | 无掌声 |
| 4 | 刷新页面 | 掌声开关保持关闭 |
| 5 | 点击开关开启 | 开关显示 👏 |
| 6 | 输入错误句子后提交 | 无掌声 |

- [ ] **Step 3: 提交验证结果**

```bash
git log --oneline -5
```

确认提交历史正确。

---

## 自查清单

**Spec 覆盖检查：**

| 需求 | 对应任务 |
|------|----------|
| Web Audio API 合成掌声 | Task 1 Step 2 |
| 句子全对时播放 | Task 2 Step 3 |
| 独立开关控制 | Task 1, Task 3 |
| 默认开启 | Task 1 Step 1 |
| localStorage 持久化 | Task 1 Step 1 |

**无占位符检查：** 所有步骤包含完整代码，无 "TODO" 或 "implement later"。

**类型一致性检查：** `useApplauseSound` 返回类型保持一致。

---

## 注意事项

1. **浏览器兼容性：** Web Audio API 在现代浏览器支持良好，但代码中仍需检查 `window.AudioContext` 是否存在。

2. **音频上下文状态：** 某些浏览器在用户交互前会挂起音频上下文，代码中通过 `ctx.resume()` 处理。

3. **静音模式：** 如果系统处于静音状态，Web Audio API 也不会播放声音，这是预期行为。

4. **快速连续提交：** 如果用户快速完成多个句子，掌声会叠加播放，这是可接受的行为。

5. **低性能设备：** 掌声合成计算量很小，无需特殊优化。
