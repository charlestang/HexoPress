## Context

HexoPress 编辑器当前由 FrameView.vue 承载，左侧边栏包含三个面板（FileExplorer、TocPanel、MediaPanel），通过 `panels` 注册表和 `currentPanel` 状态切换。编辑器核心使用 md-editor-v3（基于 CodeMirror 6），内容通过 `v-model="text"` 双向绑定。

用户配置通过 `web-storage-cache`（localStorage 封装）持久化，由 appStore 管理。editorStore 已有 `currentHeadings`、`activeHeading` 等共享状态的先例。

本次变更在侧边栏新增 AiPanel，提供聊天式 AI 辅助写作能力。

## Goals / Non-Goals

**Goals:**
- 在编辑器侧边栏提供可用的 AI 聊天面板，支持自由对话和预置功能
- 支持用户配置多个 OpenAI 兼容 API 端点
- 支持流式响应（SSE），实时显示 AI 回复
- 智能 Context 管理：自动检测选区/全文，front-matter 始终附带
- 预置功能：错别字检查、写作建议、段落润色、生成摘要

**Non-Goals:**
- 不做自动替换选区功能（用户手动复制粘贴 AI 回复）
- 不支持多模态（图片上传等）
- 不支持自定义预置功能（留待后续迭代）
- 不走 IPC 通道调用 AI API（渲染进程直接 fetch）
- 不做聊天历史持久化（切换文章即清空）

## Decisions

### Decision 1: 渲染进程直接调用 AI API

**选择**：渲染进程通过 `fetch()` 直接请求 OpenAI 兼容端点

**替代方案**：
- 主进程代理（IPC Event Stream）：更安全但增加复杂度，需要新增 IPC 通道和流式转发逻辑
- MessagePort 通道：优雅但过度设计

**理由**：Electron 渲染进程无 CORS 限制，桌面应用中 API Key 本就存储在本地，安全性差异可忽略。直接 fetch 最简单，无需修改主进程代码。

### Decision 2: 通过 editorStore 共享编辑器状态

**选择**：扩展 editorStore，新增 `text`、`frontMatter`、`selectedText`、`selectionRange` 状态

**替代方案**：
- FrameView props/emit 中转：可行但耦合度高，FrameView 需要感知 AI 相关逻辑
- 新建独立 aiStore：状态分散，editorStore 已有共享状态先例

**理由**：editorStore 已有 `currentHeadings` 等跨组件共享的模式。编辑器状态（文本、选区）本质上属于编辑器领域，放在 editorStore 语义清晰。AiPanel 只读消费这些状态。

### Decision 3: markdown-it 轻量渲染聊天气泡

**选择**：使用 `markdown-it` 渲染 AI 回复中的 Markdown

**替代方案**：
- md-editor-v3 的 MdPreview 组件：功能完整但过重（含 mermaid、katex、medium-zoom 等）
- 纯文本显示：过于简陋，AI 回复常含代码块和列表

**理由**：markdown-it 已是 md-editor-v3 的传递依赖，添加为直接依赖不增加包体积。轻量且满足聊天场景需求（代码块、列表、加粗、链接）。

### Decision 4: AI 提供商配置存储在 localStorage

**选择**：复用现有 `web-storage-cache` 机制，在 appStore 中管理 `aiProviders` 数组和 `defaultAiProviderId`

**替代方案**：
- Electron Store（主进程文件存储）：更安全但需要新增 IPC 通道
- 加密存储：增加复杂度，桌面应用场景下收益有限

**理由**：与现有配置（locale、darkMode、editMode 等）保持一致的存储模式。API Key 存储在本地 localStorage 中，对桌面应用可接受。用户选择的默认供应商也通过同一机制持久化。

### Decision 5: AiProvider 四属性配置

**选择**：每个 AiProvider 包含 `name`、`baseUrl`、`apiKey`、`provider`（API 规范，如 "openai"）、`modelId`（模型标识符）

**替代方案**：
- 仅 name/baseUrl/apiKey + 运行时 mode 选择（quick/think）：不够灵活，mode 概念与实际 API 调用不匹配

**理由**：`provider` 字段预留 API 规范扩展（当前仅 OpenAI Compatible），`modelId` 直接映射到 API 请求的 `model` 参数，语义清晰。AiInputBar 显示供应商下拉框 + Model ID 标签，取代原来的 mode 下拉框。

### Decision 6: 预置功能填充输入框而非自动发送

**选择**：点击预置按钮将结构化提示词填入输入框，用户审阅/编辑后手动发送

**替代方案**：
- 点击即自动发送：用户无法审阅和调整提示词

**理由**：让用户看到实际发送的提示词内容，可以根据需要编辑调整。聊天气泡显示预置功能的短标签（如"📝 错别字检查"），而非完整提示词，保持界面整洁。提示词采用结构化格式（任务、输出格式、语言要求），便于软件作者迭代调优。

### Decision 7: 设置页面 Tab 分区

**选择**：PreferencesView 使用 el-tabs 将设置分为"通用"和"AI"两个标签页

**理由**：AI 配置与通用设置属于不同领域，Tab 分区使页面结构清晰，避免 AI 配置区出现在保存按钮下方的尴尬布局。

### Decision 8: 组件结构

```
AiPanel.vue                    面板主体，管理聊天状态和 context
├── 预置功能区                  内联在 AiPanel 中，一组按钮（点击填充输入框）
├── 聊天消息区                  v-for 渲染 AiMessageBubble
│   └── AiMessageBubble.vue    单条消息，markdown-it 渲染；预置消息显示短标签
├── Context 状态栏              内联在 AiPanel 中
├── 拖拽分割线                  ns-resize 光标，拖动调整输入区高度
└── AiInputBar.vue             输入框 + 供应商选择 + Model ID 标签 + 发送
```

AiPanel 持有聊天状态（messages 数组）、context 状态和 activePreset 状态。AiInputBar 通过 emit 向上传递用户输入和供应商选择，供应商选择通过 appStore.defaultAiProviderId 持久化。aiService.ts 封装 fetch + SSE 解析逻辑，使用 provider.modelId 作为 API 请求的 model 参数。

## Risks / Trade-offs

- **[API Key 明文存储]** → localStorage 中 API Key 未加密。桌面应用可接受，但应在 UI 上用密码输入框遮蔽显示。未来可考虑 Electron safeStorage API。
- **[长文章 token 超限]** → 全文传入可能超出模型 token 限制。初期不做截断处理，依赖用户选择合适的模型。后续可加 token 估算和警告。
- **[SSE 解析兼容性]** → 不同 AI 提供商的 SSE 格式可能有细微差异。aiService 需要健壮的 chunk 解析逻辑，处理不完整的 JSON 行。
- **[侧边栏宽度]** → 280px 对聊天界面偏窄。保持与其他面板一致，用户可拖拽调宽。
- **[keep-alive 与聊天状态]** → FrameView 使用 `<keep-alive>` 缓存面板组件，切换面板时 AiPanel 状态会保留，这是期望行为。但切换文章时需要主动清空。
