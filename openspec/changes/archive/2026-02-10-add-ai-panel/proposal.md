## Why

HexoPress 目前的编辑器缺少 AI 辅助写作能力。作为博客桌面编辑器，用户在写作过程中经常需要错别字检查、段落润色、写作建议等辅助功能。通过集成 OpenAI 兼容的 AI API，可以在编辑器侧边栏提供聊天式 AI 助手，提升写作效率和文章质量。

## What Changes

- 在编辑器左侧边栏新增 **AiPanel** 面板，与现有的 FileExplorer、TocPanel、MediaPanel 并列
- AiPanel 内包含：预置功能区（错别字检查、写作建议、段落润色、生成摘要）、聊天消息区、Context 状态栏、拖拽分割线、输入框组件
- 预置功能点击后将结构化提示词填入输入框供用户审阅编辑，手动发送；聊天气泡显示短标签
- 新增 **AiInputBar** 输入框组件：底部工具栏含供应商选择下拉框、Model ID 标签显示、发送按钮；用户选择的供应商持久化记忆
- 新增 **AiMessageBubble** 消息气泡组件：使用 markdown-it 轻量渲染 AI 回复；预置功能消息显示短标签而非完整提示词
- 渲染进程直接调用 OpenAI 兼容 API 端点（无需走 IPC），支持 SSE 流式响应
- 扩展 **editorStore**：新增 selectedText、selectionRange、frontMatter 等共享状态，供 AiPanel 读取编辑器上下文
- 扩展 **appStore**：新增 aiProviders 配置（名称、端点、API Key、API 规范、Model ID）及 defaultAiProviderId 持久化
- 在 **PreferencesView** 中新增 Tab 标签页导航（通用 / AI），AI 标签页包含提供商配置区
- Context 智能检测：有选区时自动附着 @selection，无选区时附着 @full，front-matter 始终附带；用户可手动移除 context
- 切换文章时清空聊天历史，开始新会话

## Capabilities

### New Capabilities
- `ai-chat-panel`: AI 聊天面板 — 侧边栏聊天界面、消息渲染、流式响应、Context 管理
- `ai-provider-config`: AI 提供商配置 — Preferences 中配置 OpenAI 兼容端点、API Key、模型选择
- `ai-presets`: AI 预置功能 — 错别字检查、写作建议、段落润色、生成摘要等预置 prompt 模板

### Modified Capabilities
- `editor-ux`: 编辑器需要将选区状态和全文内容同步到 editorStore，供 AiPanel 消费

## Impact

- **新增依赖**：`markdown-it`（聊天气泡 Markdown 渲染）
- **渲染进程**：新增 3 个组件（AiPanel、AiInputBar、AiMessageBubble）、1 个 service（aiService.ts）
- **状态管理**：editorStore 扩展（选区、全文、front-matter 共享）、appStore 扩展（AI 配置持久化）
- **FrameView**：panels 注册表新增 aiPanel 条目，侧边栏新增 outline 风格机器人 SVG 图标
- **PreferencesView**：新增 Tab 标签页导航（通用 / AI），AI 标签页包含提供商配置表单
- **类型定义**：types/local.d.ts 新增 AiProvider、AiPreset、AiMessage 等类型
- **i18n**：en.json 和 zh-CN.json 新增 AI 相关文案
- **无 IPC 变更**：AI API 调用在渲染进程直接 fetch，不新增 IPC 通道
- **无主进程变更**：不涉及 HexoAgent、FsAgent、HttpServer
