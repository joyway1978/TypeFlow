# 逐词输入模式 - 设计方案

> 日期：2026-05-01
> 状态：已验证

## 背景

当前输入是一次性整句输入（textarea + 提交按钮）。改为逐词输入：
- 句子拆分为单词列表，一次只输入一个单词
- 空格键确认当前词并跳到下一个
- 退格键回退到上一个词重新输入
- 全部单词输入完成后自动提交

## 决策记录

| 决策 | 选项 |
|------|------|
| 单词判断方式 | 前端即时判断（忽略大小写），全部完成后调用 `/api/check` 做完整校对 |
| 错误后回退 | 允许按退格键回退到上一个词 |
| 句子展示 | 展示完整句子，当前词高亮 |

## 核心状态变化

`usePractice` 新增逐词状态：

```
words: string[]           // 当前句子的目标词列表
currentWordIndex: number  // 当前正在输入第几个词
wordInputs: string[]      // 每词的用户输入
wordStatuses: ('pending' | 'correct' | 'wrong')[]
```

状态流转：
1. 初始化：`wordInputs = []`，`currentWordIndex = 0`
2. 输入中：当前词实时更新 `wordInputs[currentWordIndex]`
3. 空格确认：前端对比判定（忽略大小写），`currentWordIndex++`
4. 退格回退：`currentWordIndex > 0` 且当前输入为空时，`currentWordIndex--`
5. 全部完成：`currentWordIndex === words.length`，自动调用 `/api/check`

## 组件变更

### SentenceDisplay
- 从纯文本 → 逐词 `<span>` 渲染
- 已输入词显示状态色（绿/红），当前词 Bookmark Gold 下划线高亮，待输入词 Faded Ink 灰色

### TypingInput → WordInput
- 多行 textarea → 单行 `<input>`
- 空格键确认当前词，退格键回退
- 占位符显示目标词（半透明）
- 自动聚焦，下划线风格保持不变

### SubmitButton
- 移除——最后一个词空格后自动提交

### page.tsx
- 阶段 flow 不变，`typing` 阶段用 WordInput 替代 TypingInput + SubmitButton

## 交互流程图

```
idle → 点击播放
  ↓
listening → 音频结束
  ↓
typing → 逐词输入，空格确认
  │        ↑ 退格回退
  ↓        (currentWordIndex === words.length)
checking → /api/check
  ↓
feedback → 展示结果 + 下一句
  ↓
idle (下一句)
```
