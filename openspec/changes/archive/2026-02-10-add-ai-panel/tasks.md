## 1. 基础设施：类型定义与依赖 (renderer)

- [x] 1.1 在 `types/local.d.ts` 中新增 AI 相关类型定义：`AiProvider`（id, name, baseUrl, apiKey, provider, modelId）、`AiPreset`（id, name, icon, systemPrompt, userPrompt, contextMode）、`AiMessage`（role, content, contextLabel, presetLabel）、`SelectionRange`（from, to）
- [x] 1.2 安装 `markdown-it` 为直接依赖，安装 `@types/markdown-it` 为 devDependency
- [x] 1.3 在 `src/locales/en.json` 和 `src/locales/zh-CN.json` 中新增 AI 相关 i18n 文案（面板标题、预置功能名称、占位文本、提示信息等）

## 2. 状态管理：Store 扩展 (renderer)

- [x] 2.1 扩展 `src/stores/editorStore.ts`：新增 `text`、`frontMatter`、`selectedText`、`selectionRange` 状态及对应 setter 方法
- [x] 2.2 扩展 `src/stores/app.ts`：新增 `aiProviders` 数组状态和 `defaultAiProviderId` 状态，使用 `web-storage-cache` 持久化，提供 add/update/remove 方法及 setDefaultAiProviderId

## 3. AI 服务层 (renderer)

- [x] 3.1 创建 `src/services/aiService.ts`：封装 OpenAI 兼容 API 的 fetch 调用，支持 SSE 流式响应解析，返回 AsyncGenerator 逐 chunk 产出内容
- [x] 3.2 在 aiService 中实现请求组装逻辑：根据 contextMode（full/selection/none）组装 system prompt 和 user message，始终附带 front-matter

## 4. 编辑器状态同步 (renderer)

- [x] 4.1 修改 `src/components/EditorMain.vue`：将 `text` 内容同步到 editorStore（watch text → editorStore.setText）
- [x] 4.2 修改 `src/components/EditorMain.vue`：监听 CodeMirror 选区变化，通过 `getEditorView().state.selection` 获取选区范围，同步到 editorStore 的 `selectedText` 和 `selectionRange`
- [x] 4.3 修改 `src/components/EditorMain.vue`：将 front-matter 数据同步到 editorStore

## 5. AI 面板组件 (renderer)

- [x] 5.1 创建 `src/components/AiMessageBubble.vue`：单条消息气泡组件，区分 user/assistant 角色样式，使用 markdown-it 渲染 assistant 消息内容，user 消息显示 context 标识
- [x] 5.2 创建 `src/components/AiInputBar.vue`：输入框组件，底部工具栏包含供应商选择下拉框（读取 appStore.aiProviders，持久化选择到 defaultAiProviderId）、Model ID 标签显示、发送按钮；无可用供应商时禁用发送并显示提示；暴露 setInput 方法供预置功能填充
- [x] 5.3 创建 `src/components/AiPanel.vue`：面板主体，包含预置功能按钮区（点击填充输入框）、聊天消息滚动区（v-for AiMessageBubble）、Context 状态栏（显示 @full/@selection 及 ✕ 按钮）、拖拽分割线（ns-resize）、AiInputBar；管理聊天状态（messages 数组）、context 状态和 activePreset 状态

## 6. 面板集成 (renderer)

- [x] 6.1 修改 `src/views/FrameView.vue`：在 panels 注册表中添加 `aiPanel: AiPanel`，侧边栏新增 outline 风格机器人 SVG 图标按钮，传递必要的 props
- [x] 6.2 在 FrameView 中处理文章切换时的会话重置：监听路由变化或 EditorMain 的文章加载事件，通知 AiPanel 清空聊天历史

## 7. AI 提供商配置 (renderer)

- [x] 7.1 修改 `src/views/PreferencesView.vue`：使用 el-tabs 分为"通用"和"AI"两个标签页；AI 标签页包含提供商配置区，每个提供商卡片含名称、端点、API Key 密码框、API 规范下拉框、Model ID 输入框、添加/删除按钮，数据绑定到 appStore.aiProviders

## 8. 预置功能 (renderer)

- [x] 8.1 在 AiPanel 中实现预置功能按钮逻辑：点击填充结构化提示词到输入框，记录 activePreset，发送时使用预置的 systemPrompt 和 contextMode，气泡显示短标签
- [x] 8.2 实现选区类预置功能的校验

## 9. 测试与验证

- [x] 9.1 为 `aiService.ts` 编写单元测试：测试请求组装逻辑、SSE chunk 解析、错误处理
- [x] 9.2 运行 `npm run check-all` 确保类型检查通过
- [x] 9.3 运行 `npm run test` 确保所有测试通过
- [x] 9.4 运行 `npm run lint` 和 `npm run format` 确保代码规范

## 10. 实现后优化（第二轮迭代）

- [x] 10.1 重构 AiProvider 类型：新增 `provider`（API 规范）和 `modelId` 字段；AiInputBar 移除 mode 下拉框，改为供应商选择 + Model ID 标签显示；aiService.streamChat 使用 provider.modelId 作为 API model 参数
- [x] 10.2 重构预置功能交互：点击预置按钮填充结构化提示词到输入框（而非自动发送）；AiPreset 新增 `userPrompt` 字段；AiMessage 新增 `presetLabel` 字段；AiMessageBubble 显示短标签
- [x] 10.3 重写四个预置功能的提示词：结构化格式（角色、任务、输出格式），中文提示词，包含"使用与文章相同的语言回复"指令
- [x] 10.4 重构 PreferencesView：使用 el-tabs 分为"通用"和"AI"两个标签页；AI 标签页包含提供商配置卡片（含 provider 下拉框和 modelId 输入框）
- [x] 10.5 持久化默认 AI 供应商选择：appStore 新增 `defaultAiProviderId` + `setDefaultAiProviderId`；AiInputBar 使用 computed getter/setter 读写 store；删除供应商时清空默认选择
- [x] 10.6 输入区域拖拽调整高度：AiPanel 新增 resize handle（ns-resize 光标）；mousedown/mousemove/mouseup 拖拽逻辑；AiInputBar 改为 flex 布局填满容器
- [x] 10.7 AI 面板图标改为 outline 风格机器人 SVG（stroke 描边，与其他 Element Plus outline 图标风格一致）
