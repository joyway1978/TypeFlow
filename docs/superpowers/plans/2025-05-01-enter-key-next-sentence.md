# Enter 键进入下一句实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Feedback 阶段按 Enter 键进入下一个句子

**Architecture:** 在 page.tsx 添加全局键盘监听 useEffect，检测 Feedback 阶段的 Enter 键按下，调用 nextSentence()

**Tech Stack:** Next.js 14 + React 18 + TypeScript

---

## Task 1: 添加 Enter 键监听并更新提示文字

**Files:**
- Modify: `frontend/app/page.tsx`

### Step 1: 添加键盘监听 useEffect

在 `frontend/app/page.tsx` 中，找到其他 useEffect 附近，添加新的 useEffect：

```typescript
// 在文件顶部确保导入 useEffect
import { useCallback, useEffect, useRef } from 'react';

// ... 其他代码 ...

// 添加在 submittedRef useEffect 之后
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
```

### Step 2: 更新底部提示文字

找到文件底部的提示文字：

```tsx
<p className="mt-8 font-serif text-xs text-ink-faded">
  Press Space to confirm &middot; Backspace to go back &middot; Listen, type, learn.
</p>
```

修改为：

```tsx
<p className="mt-8 font-serif text-xs text-ink-faded">
  Press Space to confirm &middot; Backspace to go back &middot; Enter for next
</p>
```

### Step 3: 完整修改后的相关代码

确保 useEffect 依赖数组正确：

```typescript
// 监听 Enter 键进入下一句
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
```

### Step 4: TypeScript 检查

运行类型检查确保无错误：

```bash
cd frontend && npx tsc --noEmit
```

Expected: 无错误输出

### Step 5: 提交

```bash
git add frontend/app/page.tsx
git commit -m "feat: Add Enter key shortcut to go to next sentence in feedback phase"
```

---

## 验证清单

- [ ] 进入 feedback 阶段（完成听写后）
- [ ] 按 Enter 键，进入下一句
- [ ] 底部提示显示 "Enter for next"
- [ ] 其他阶段（typing/listening）按 Enter 无作用
