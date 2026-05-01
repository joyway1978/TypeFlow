# 掌声音效设计文档

## 目标

当用户完成一个句子且全部输入正确时，播放 Web Audio API 合成的掌声音效，提供正向反馈。

## 需求

1. **触发条件**：当前句子所有单词输入正确，进入反馈阶段时播放
2. **实现方式**：Web Audio API 合成（不依赖外部音频文件）
3. **用户控制**：独立开关，默认开启
4. **持久化**：开关状态保存到 localStorage

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                    usePractice.ts                        │
│  ┌─────────────┐     ┌─────────────┐                    │
│  │ submitInput │────▶│ checkResult │                    │
│  └─────────────┘     └──────┬──────┘                    │
│                             │                           │
│                             ▼                           │
│                        ┌─────────┐                      │
│                        │allCorrect?│                    │
│                        └────┬────┘                      │
│                             │ yes                       │
│                             ▼                           │
│                      ┌─────────────┐                    │
│                      │ playApplause()│◀─────────────────┤
│                      └─────────────┘                    │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                useApplauseSound.ts                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Web Audio API 合成器                │   │
│  │  • 白噪声源 (White Noise Buffer)                 │   │
│  │  • 带通滤波器 (Bandpass Filter)                  │   │
│  │  • 指数衰减包络 (Exponential Ramp)               │   │
│  │  • 多声道叠加 (Stereo Spacing)                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              配置管理                            │   │
│  │  • localStorage key: typeflow-applause-enabled  │   │
│  │  • 默认值: true                                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 组件设计

### useApplauseSound Hook

```typescript
// hooks/useApplauseSound.ts
interface UseApplauseSoundReturn {
  play: () => void;           // 播放掌声
  enabled: boolean;           // 当前开关状态
  toggle: () => void;         // 切换开关
}

function useApplauseSound(): UseApplauseSoundReturn
```

**掌声合成算法：**

```
单次拍手 = 白噪声 → 带通滤波(800-4000Hz) → 增益包络(快速衰减)

完整掌声 = 3-5 次拍手叠加
         • 时间随机偏移 (0-200ms)
         • 频率微调 (±200Hz)
         • 左右声道分离 (±0.3 pan)
         • 增益递减 (模拟距离感)
```

### 开关 UI

位置：`frontend/app/page.tsx` 设置区域

新增一个开关按钮：
- 图标：👏 / 🔇
- 标签："掌声"
- 位置：打字机音效开关旁边

## 集成点

### 1. usePractice.ts

在 `submitInput` 函数中，检测到全部正确后调用：

```typescript
const { play: playApplause, enabled: applauseEnabled } = useApplauseSound();

// 在 checkResult 后
if (allCorrect && applauseEnabled) {
  playApplause();
}
```

### 2. page.tsx

在设置区域添加开关：

```typescript
const { enabled: applauseEnabled, toggle: toggleApplause } = useApplauseSound();

// UI: 掌声开关按钮
<button onClick={toggleApplause}>
  {applauseEnabled ? '👏' : '🔇'} 掌声
</button>
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `hooks/useApplauseSound.ts` | 新建 | 掌声 Hook |
| `hooks/usePractice.ts` | 修改 | 集成掌声触发 |
| `app/page.tsx` | 修改 | 添加开关 UI |

## 技术细节

### 掌声合成参数

```javascript
// 白噪声缓冲区
const bufferSize = sampleRate * 0.5; // 500ms

// 带通滤波
filter.type = 'bandpass';
filter.frequency.value = 1200; // Hz
filter.Q.value = 1;

// 包络
envelope.setValueAtTime(0.8, now);
envelope.exponentialRampToValueAtTime(0.01, now + 0.15);
```

### localStorage Key

- `typeflow-applause-enabled`: boolean string ('true' | 'false')

## 边界情况

| 场景 | 处理 |
|------|------|
| 浏览器不支持 Web Audio | 静默跳过，不报错 |
| 用户快速连续完成句子 | 每次独立播放（会叠加） |
| 音频上下文被挂起 | 尝试 resume，失败则跳过 |
| localStorage 读取失败 | 使用默认值 true |

## 验收标准

- [ ] 句子全对时播放掌声音效
- [ ] 有独立开关控制
- [ ] 开关默认开启
- [ ] 开关状态持久化
- [ ] 不依赖外部音频文件
- [ ] 在低性能设备上也能正常播放
