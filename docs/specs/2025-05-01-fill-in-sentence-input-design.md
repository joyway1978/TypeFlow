# 填空式句子输入 + 重听按钮设计文档

## 背景

当前 TypeFlow 的逐词输入模式使用独立的 `WordInput` 组件，用户在一个单独的输入框中输入单词。这种设计的问题是：
1. 用户无法看到完整句子的上下文
2. 输入框有 placeholder 提示目标单词，降低了听写难度
3. 缺少重听功能，用户没听清时无法重新播放

## 目标

重构输入界面，实现「填空式」句子输入：
- 完整句子始终可见，单词位置用下划线占位
- 用户在句子中直接输入，无提示
- 已输入单词保留显示，当前输入位置高亮
- 添加重听按钮，随时重新播放句子音频

## 设计

### 1. InteractiveSentence 组件

替代原有的 `SentenceDisplay` + `WordInput`，合并为可交互的句子填空组件。

#### 渲染逻辑

每个单词根据状态渲染不同样式：

| 状态 | 显示 | 样式 |
|------|------|------|
| `pending` | 下划线占位符 | `border-bottom: 1.5px solid #C5B9A8`，长度匹配单词 |
| `current` | 输入框 | 无边框，底部 `2px solid #B8860B`（金色），透明背景 |
| `correct` | 用户输入词 | 墨绿色 `#2D4A3E` |
| `wrong` | 用户输入词 | 红色 `#C0392B` |

#### 输入框行为

- **自动聚焦**：`current` 状态的输入框自动 `focus()`
- **宽度自适应**：输入框宽度 = 目标单词长度 × 字符宽度（使用等宽字体计算）
- **空格确认**：按下空格键调用 `onConfirm()`，自动跳到下一个词
- **退格返回**：输入为空时按退格，调用 `onGoBack()` 返回上一词
- **禁用自动修正**：`autoComplete="off" autoCorrect="off" spellCheck={false}`

#### Props

```typescript
interface InteractiveSentenceProps {
  words: string[];                    // 句子单词列表
  currentWordIndex: number;           // 当前输入位置
  wordInputs: string[];               // 用户输入数组
  wordStatuses: WordStatus[];         // 单词状态数组
  onChange: (value: string) => void;  // 输入回调
  onConfirm: () => void;              // 确认单词
  onGoBack: () => void;               // 返回上一词
  disabled?: boolean;                 // 禁用状态
}
```

### 2. ReplayButton 组件

重听按钮，图标 + 文字组合。

#### 样式

- 图标：`Volume2`（Lucide）
- 文字：「重听」
- 布局：flex 横向，图标在左，文字在右，间距 8px
- 颜色：墨水色 `#1C1B1A`，hover 时加深
- 尺寸：padding `8px 16px`，圆角 `6px`

#### Props

```typescript
interface ReplayButtonProps {
  onClick: () => void;
  disabled?: boolean;
}
```

### 3. 页面结构调整

**page.tsx 变更：**

1. 移除 `WordInput` 导入和使用
2. 新增 `InteractiveSentence` 和 `ReplayButton` 导入
3. 条件渲染调整：
   - `listening` 阶段：显示 `InteractiveSentence`（全部 pending）
   - `typing` 阶段：显示 `InteractiveSentence`（交互状态）
   - `feedback` 阶段：显示 `InteractiveSentence`（只读状态）
4. 重听按钮位置：句子下方，居中显示
5. 播放按钮（PlayButton）只在 `idle` 阶段显示，其他阶段隐藏

### 4. 状态管理

**usePractice.ts 无需改动**，继续使用：
- `updateCurrentWord(value)` - 更新当前输入
- `confirmWord()` - 确认当前单词
- `goBackWord()` - 返回上一词

新增：
- `replay()` - 调用 `useAudio` 的 replay 方法重新播放当前句子音频

### 5. 视觉流程

#### Idle 阶段
- 显示提示文字：「点击播放开始听写」
- 显示 PlayButton

#### Listening 阶段
- 显示 InteractiveSentence（全部 pending，下划线占位）
- 显示 ReplayButton
- 音频播放中

#### Typing 阶段
- 显示 InteractiveSentence（current 位置显示输入框）
- 显示 ReplayButton
- 用户输入，空格确认，自动跳到下一个

#### Feedback 阶段
- 显示 InteractiveSentence（correct/wrong 状态，只读）
- 显示 ReplayButton
- 显示 FeedbackReport 和 StatsBar
- 显示 NextButton

## 技术细节

### 输入框宽度计算

使用等宽字体 `JetBrains Mono`，每个字符宽度固定。输入框宽度 = `ch` 单位 × (目标单词长度 + 1)。

```css
width: ${word.length + 1}ch;
```

### 退格键处理

只在 `current` 状态的输入框监听键盘事件：
- `Space`：阻止默认行为，调用 `onConfirm()`
- `Backspace`：如果 `value === ''`，阻止默认行为，调用 `onGoBack()`

### 自动聚焦

使用 `useEffect` + `useRef`，当 `currentWordIndex` 变化时，自动聚焦到新位置的输入框。

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `components/InteractiveSentence.tsx` | 新建 | 可交互句子填空组件 |
| `components/ReplayButton.tsx` | 新建 | 重听按钮组件 |
| `components/SentenceDisplay.tsx` | 保留 | feedback 阶段仍可使用（只读模式）|
| `components/WordInput.tsx` | 删除 | 被 InteractiveSentence 替代 |
| `app/page.tsx` | 修改 | 调整组件使用和布局 |
| `hooks/usePractice.ts` | 可选修改 | 如需要暴露 replay 方法 |

## 验收标准

- [ ] 句子完整显示，每个单词位置用 border-bottom 下划线占位
- [ ] 下划线长度与单词长度匹配
- [ ] 当前输入位置显示输入框，无边框，底部金色高亮
- [ ] 输入框无 placeholder 提示
- [ ] 空格确认单词，自动跳到下一个位置
- [ ] 退格键在输入为空时返回上一词
- [ ] 已输入正确单词显示墨绿色，错误显示红色
- [ ] 重听按钮显示在句子下方，图标+文字样式
- [ ] 点击重听按钮重新播放当前句子音频
