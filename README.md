# TypeFlow

「纸上练习」—— 沉浸式英语听写练习应用。

Listen, type, learn. 一个安静的「学习角落」：一张纸、一支笔、一段朗读、一次书写。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 + React 18 + TypeScript + Tailwind CSS 3 |
| 后端 | Python FastAPI + Edge TTS (微软 Azure TTS) |
| 包管理 | npm (前端) / uv (后端) |

## 功能

- **听写练习**：句子朗读 → 打字输入 → 逐词反馈
- **智能纠错**：基于 Levenshtein 词对齐算法，区分正确、错误、大小写/标点忽略三种状态
- **语音合成**：Edge TTS 生成自然发音，带缓存机制
- **三阶段交互**：初始态（句子展示+播放）→ 输入态（打字）→ 反馈态（逐词对比）

## 快速开始

### 前置条件

- Node.js >= 18
- Python >= 3.11
- [uv](https://github.com/astral-sh/uv) (Python 包管理)

### 启动后端

```bash
cd backend
python start.py
```

后端运行在 `http://localhost:8000`。

API 端点：
- `POST /api/tts` — 文字转语音
- `POST /api/check` — 答案检查与逐词对比
- `GET /api/tts/audio/{key}` — 获取缓存音频文件

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:3000`。

## 项目结构

```
TypeFlow/
├── frontend/
│   ├── app/              # Next.js App Router 页面
│   ├── components/       # React 组件
│   │   ├── PaperSheet    # 纸张容器
│   │   ├── SentenceDisplay  # 句子展示
│   │   ├── PlayButton    # 播放按钮（含声波动画）
│   │   ├── TypingInput   # 打字输入框
│   │   ├── FeedbackReport # 逐词反馈
│   │   ├── StatsBar      # 统计条
│   │   ├── ProgressBar   # 进度指示
│   │   └── ...
│   ├── hooks/            # 自定义 Hooks (usePractice, useAudio)
│   └── lib/              # API 调用、类型定义、题库
├── backend/
│   ├── main.py           # FastAPI 应用 & API 路由
│   ├── start.py          # 启动脚本
│   └── pyproject.toml    # Python 依赖
└── DESIGN.md             # 完整设计文档（色彩/字体/布局/动效）
```

## 设计理念

设计核心：**如何让用户进入并保持专注练习的「心流」状态**。

以「旧纸张 + 墨水笔迹」为色彩叙事，模拟纸上听写体验。详见 [DESIGN.md](./DESIGN.md)。
