# 下划线基线对齐设计文档

## 背景

当前 `InteractiveSentence` 组件中，输入框和占位符下划线高度不一致。当用户输入单词时，输入框的高度导致整行下划线向下移动，视觉体验不够连贯。

## 目标

确保所有单词的下划线固定在底部同一水平线，输入时只有文字向上延伸，下划线位置保持不变。

## 设计

### 1. 外层容器调整

将 `<p>` 标签改为 flex 布局，使用 `items-baseline` 或 `items-end` 确保所有子元素底部对齐：

```tsx
<p className="flex flex-wrap justify-center items-baseline font-serif text-xl leading-relaxed md:text-2xl">
```

### 2. 单词 span 调整

每个单词 span 使用 `inline-flex items-end` 确保内部元素底部对齐：

```tsx
<span key={index} className="inline-flex items-end">
```

### 3. 占位符样式调整

占位符 span 添加 `h-6`（或适当高度）确保与输入框对齐：

```tsx
<span
  className="inline-block font-mono text-input text-ink-faded border-b-[1.5px] border-paper-edge h-6 flex items-end"
  style={{ width: `${word.length}ch`, minWidth: '2ch' }}
>
  {'\u00A0'}
</span>
```

### 4. 输入框样式调整

确保输入框无额外 padding/margin，与占位符高度一致：

```tsx
<input
  className="inline-block bg-transparent font-mono text-input text-ink outline-none border-b-2 border-bookmark-gold px-0 py-0 m-0 h-6"
  style={{ width: `${word.length + 1}ch`, minWidth: '2ch' }}
/>
```

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/components/InteractiveSentence.tsx` | 修改 | 调整布局确保基线对齐 |

## 验收标准

- [ ] 所有单词下划线在同一水平线上
- [ ] 输入单词时，下划线位置不移动
- [ ] 正确单词、错误单词、输入框、占位符的下划线对齐
