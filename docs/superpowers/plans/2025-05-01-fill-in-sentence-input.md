# 填空式句子输入 + 重听按钮实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 重构输入界面为填空式句子输入，移除单词提示，添加重听按钮

**Architecture:** 新建 InteractiveSentence 组件合并展示和输入，根据单词状态渲染不同样式（下划线占位/输入框/正确/错误），新增 ReplayButton 组件，调整 page.tsx 整合

**Tech Stack:** Next.js 14 + React 18 + TypeScript + Tailwind CSS + Lucide Icons

---

## 文件结构

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/components/InteractiveSentence.tsx` | 创建 | 可交互句子填空组件 |
| `frontend/components/ReplayButton.tsx` | 创建 | 重听按钮组件 |
| `frontend/app/page.tsx` | 修改 | 整合新组件，调整布局 |
| `frontend/components/WordInput.tsx` | 删除 | 被 InteractiveSentence 替代 |

---

## Task 1: 创建 InteractiveSentence 组件

**Files:**
- Create: `frontend/components/InteractiveSentence.tsx`

**背景:** 当前使用独立的 SentenceDisplay + WordInput，需要合并为填空式交互组件

### Step 1: 创建组件文件

创建 `frontend/components/InteractiveSentence.tsx`：

```typescript
'use client';
import { useRef, useEffect } from 'react';
import type { WordStatus } from '@/lib/types';

interface InteractiveSentenceProps {
  words: string[];
  currentWordIndex: number;
  wordInputs: string[];
  wordStatuses: WordStatus[];
  onChange: (value: string) => void;
  onConfirm: () => void;
  onGoBack: () => void;
  disabled?: boolean;
}

export function InteractiveSentence({
  words,
  currentWordIndex,
  wordInputs,
  wordStatuses,
  onChange,
  onConfirm,
  onGoBack,
  disabled = false,
}: InteractiveSentenceProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦当前输入框
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, currentWordIndex]);

  if (words.length === 0) {
    return (
      <p className="text-center text-ink-faded">No sentence loaded.</p>
    );
  }

  return (
    <p className="text-center font-serif text-xl leading-relaxed md:text-2xl">
      {words.map((word, index) => {
        const status = wordStatuses[index] ?? 'pending';
        const isCurrent = index === currentWordIndex;
        const inputValue = wordInputs[index] ?? '';

        // 已确认单词（正确或错误）
        if (status === 'correct' || status === 'wrong') {
          return (
            <span key={index}>
              <span
                className={
                  status === 'correct'
                    ? 'text-correct-ink'
                    : 'text-teacher-red'
                }
              >
                {inputValue}
              </span>
              {index < words.length - 1 && ' '}
            </span>
          );
        }

        // 当前输入位置
        if (isCurrent) {
          return (
            <span key={index}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault();
                    if (!disabled && inputValue.trim().length > 0) {
                      onConfirm();
                    }
                  }
                  if (e.key === 'Backspace' && inputValue === '' && !disabled) {
                    e.preventDefault();
                    onGoBack();
                  }
                }}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="inline-block bg-transparent font-mono text-input text-ink border-b-2 border-bookmark-gold outline-none px-0 py-0 mx-0 disabled:opacity-50"
                style={{ width: `${word.length + 1}ch` }}
                aria-label={`Type word ${index + 1}`}
              />
              {index < words.length - 1 && ' '}
            </span>
          );
        }

        // 待输入单词（下划线占位）
        return (
          <span key={index}>
            <span
              className="inline-block font-mono text-input text-ink-faded border-b-[1.5px] border-paper-edge"
              style={{ width: `${word.length}ch`, minWidth: '2ch' }}
            >
              {'\u00A0'}
            </span>
            {index < words.length - 1 && ' '}
          </span>
        );
      })}
    </p>
  );
}
```

### Step 2: 提交

```bash
git add frontend/components/InteractiveSentence.tsx
git commit -m "Task 1: Create InteractiveSentence component for fill-in input"
```

---

## Task 2: 创建 ReplayButton 组件

**Files:**
- Create: `frontend/components/ReplayButton.tsx`

### Step 1: 安装 Lucide Icons（如未安装）

```bash
cd frontend && npm list lucide-react || npm install lucide-react
```

### Step 2: 创建组件文件

创建 `frontend/components/ReplayButton.tsx`：

```typescript
'use client';
import { Volume2 } from 'lucide-react';

interface ReplayButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function ReplayButton({ onClick, disabled = false }: ReplayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-ink hover:text-ink/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="重听"
    >
      <Volume2 className="w-5 h-5" />
      <span className="font-serif text-sm">重听</span>
    </button>
  );
}
```

### Step 3: 提交

```bash
git add frontend/components/ReplayButton.tsx
git commit -m "Task 2: Create ReplayButton component"
```

---

## Task 3: 修改 page.tsx 整合新组件

**Files:**
- Modify: `frontend/app/page.tsx`

### Step 1: 更新导入

修改导入部分，移除 WordInput，添加新组件：

```typescript
import { InteractiveSentence } from '@/components/InteractiveSentence';
import { ReplayButton } from '@/components/ReplayButton';
// 删除: import { WordInput } from '@/components/WordInput';
```

### Step 2: 更新条件渲染逻辑

修改 `showSentence` 和 `showPlayButton` 的定义：

```typescript
const showSentence = phase === 'idle' || phase === 'listening' || phase === 'typing' || phase === 'feedback';
const showPlayButton = phase === 'idle';
const showInput = phase === 'typing' || phase === 'listening';
const showFeedback = phase === 'feedback' && feedback;
const showNext = phase === 'feedback';
const showReplay = phase === 'listening' || phase === 'typing' || phase === 'feedback';
```

### Step 3: 替换 JSX 中的 WordInput

找到 WordInput 的使用位置，替换为 InteractiveSentence：

```tsx
{/* 替换原有的 WordInput 部分 */}
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
```

### Step 4: 添加重听按钮

在句子下方添加 ReplayButton：

```tsx
{showReplay && (
  <div className="mb-6 flex justify-center">
    <ReplayButton
      onClick={handleReplay}
      disabled={isPlaying || audioLoading}
    />
  </div>
)}
```

### Step 5: 完整修改后的 page.tsx

```typescript
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

  const showSentence = phase === 'idle' || phase === 'listening' || phase === 'typing' || phase === 'feedback';
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
        {showSentence && (
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
        Press Space to confirm · Backspace to go back · Listen, type, learn.
      </p>
    </main>
  );
}
```

### Step 6: 测试

启动开发服务器验证：

```bash
cd frontend && npm run dev
```

检查：
- 页面加载正常
- 点击播放按钮后句子显示下划线占位
- 输入框出现在第一个单词位置
- 空格确认跳到下一个
- 退格返回上一个
- 重听按钮显示并能点击

### Step 7: 提交

```bash
git add frontend/app/page.tsx
git commit -m "Task 3: Integrate InteractiveSentence and ReplayButton in page.tsx"
```

---

## Task 4: 删除 WordInput 组件

**Files:**
- Delete: `frontend/components/WordInput.tsx`

### Step 1: 删除文件

```bash
rm frontend/components/WordInput.tsx
```

### Step 2: 提交

```bash
git add frontend/components/WordInput.tsx
git commit -m "Task 4: Remove WordInput component (replaced by InteractiveSentence)"
```

---

## 验证清单

- [ ] 启动应用，页面正常显示
- [ ] 点击播放按钮，句子显示下划线占位（长度匹配单词）
- [ ] 第一个单词位置显示输入框，无 placeholder
- [ ] 输入单词，按空格确认，自动跳到下一个
- [ ] 退格键在输入为空时返回上一词
- [ ] 正确单词显示墨绿色，错误显示红色
- [ ] 重听按钮显示在句子下方
- [ ] 点击重听按钮重新播放音频
- [ ] 所有阶段（listening/typing/feedback）都能重听
