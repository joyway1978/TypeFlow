# Enter 键进入下一句设计文档

## 背景

当前听写完成后进入 feedback 阶段，用户需要点击 "next sentence" 按钮才能进入下一句。为提高键盘操作体验，需要支持按 Enter 键直接进入下一句。

## 目标

- Feedback 阶段按 Enter 键进入下一个句子
- 更新底部提示文字反映新快捷键

## 设计

### 1. 全局键盘监听

在 `page.tsx` 添加 `useEffect` 监听全局键盘事件：

```typescript
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

### 2. 提示文字更新

将底部提示从：
```
Press Space to confirm · Backspace to go back · Listen, type, learn.
```

更新为：
```
Press Space to confirm · Backspace to go back · Enter for next
```

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/app/page.tsx` | 修改 | 添加 Enter 键监听 useEffect |

## 验收标准

- [ ] Feedback 阶段按 Enter 键进入下一句
- [ ] 提示文字显示 "Enter for next"
- [ ] 其他阶段 Enter 键无作用
